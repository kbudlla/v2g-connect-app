//
import { useCallback, useEffect, useRef, useState } from 'react';

import { APIHookError, APIResponse } from './types';

import {
  AveragePowerMix,
  EnergyMix,
  SimpleAveragePowerMix,
  SimpleEnergyProducerType,
  addEnergyMix,
  energyMixToSimple,
  getCurrentEnergyMix,
  normalizeEnergyMix,
} from 'utils/energyMix';
import { cosineInterpolation, findClosestValueIndices } from 'utils/interpolation';
import { sigmoid } from 'utils/math';
import { resolveWithTimeout } from 'utils/mock';
import { TimeRange, getTimeSteps, unitToMs } from 'utils/time';

import moment from 'moment';

export type EnergyUsageTimestep = {
  chargedKWh: number;
  chargingRateKW: number;
  dischargedKWh: number;
  dischargeRateKW: number;
  usedKWh: number;
  batteryIn: number;
  batteryOut: number;
  // If we didn't charge, this will be the average mix.
  // Doesn't happen in this simulation, tho
  chargingMix: EnergyMix;
  timestamp: string;
};

type EnergyUsageStats = Omit<EnergyUsageTimestep, 'batteryIn' | 'batteryOut' | 'timestamp'>;

export type EnergyUsageInfo = {
  average: EnergyUsageStats;
  total: Omit<EnergyUsageStats, 'chargingRateKW' | 'dischargeRateKW' | 'chargingMix'>;
  timeseries: EnergyUsageTimestep[];
  batteryCapacityKWh: number;
};

/* Helper functions */

const averageEnergyUsage = (timeseries: EnergyUsageInfo['timeseries']): EnergyUsageInfo['average'] => {
  const chargedKWh = timeseries.reduce((acc, e) => acc + e.chargedKWh, 0) / timeseries.length;
  const chargingRateKW = timeseries.reduce((acc, e) => acc + e.chargingRateKW, 0) / timeseries.length;
  const dischargedKWh = timeseries.reduce((acc, e) => acc + e.chargedKWh, 0) / timeseries.length;
  const dischargeRateKW = timeseries.reduce((acc, e) => acc + e.dischargeRateKW, 0) / timeseries.length;
  const usedKWh = timeseries.reduce((acc, e) => acc + e.usedKWh, 0) / timeseries.length;
  const chargingMix = normalizeEnergyMix(
    timeseries.reduce((acc, e) => addEnergyMix(e.chargingMix, acc), null as EnergyMix | null),
  ) as EnergyMix;

  return {
    chargedKWh,
    chargingRateKW,
    dischargedKWh,
    dischargeRateKW,
    chargingMix,
    usedKWh,
  };
};

const totalEnergyUsage = (timeseries: EnergyUsageInfo['timeseries']): EnergyUsageInfo['total'] => {
  const chargedKWh = timeseries.reduce((acc, e) => acc + e.chargedKWh, 0);
  const dischargedKWh = timeseries.reduce((acc, e) => acc + e.chargedKWh, 0);
  const usedKWh = timeseries.reduce((acc, e) => acc + e.usedKWh, 0);

  return {
    chargedKWh,
    dischargedKWh,
    usedKWh,
  };
};

/* Constants */

// Charging speeds in kW
// https://de.wikipedia.org/wiki/Ladestation_(Elektrofahrzeug)
const ChargingSpeeds = [3.6, 5.8, 7.2, 11] as const;

// Battery capacities in kWh
// https://ev-database.org/cheatsheet/useable-battery-capacity-electric-car
const EVBatteryCapacityMin = 21.3;
const EVBatteryCapacityMax = 123.0;

// Random value, in kW
// The idea is that we're often limited by the charger and the battery related effect only kicks
// in when the maximum-rating of the car is < than what the charger can supply
const EVMaxChargingSpeedKw = 50;

// https://internationalcomparisons.org/environmental/transportation/
// This gives us ~7000km/year on average
const minKilometersDrivenPerYear = 4000;
const maxKilometersDrivenPerYear = 10000;

// How much energy do we need per kilometer (just taking the average)
// https://www.entega.de/blog/elektroauto-verbrauch/#:~:text=Der%20durchschnittliche%20Verbrauch%20auf%20100,%E2%82%AC%20und%2011%2C60%20%E2%82%AC.
const kWhPerKm = (16.7 + 30.9) / 200;

// Charging speed depends on the state of charge of the battery
// https://www.allego.eu/blog/2022/june/what-variables-affect-your-charging-speed
// And https://plotdigitizer.com/
const estimateChargingSpeedPercentage = (currentBatteryPercentage: number): number => {
  // The raw values (0 and 100 were clipped to the following interpolation works propely)
  // Sort because the graph-drawing might be bad and we just assume a convex graph
  const batteryPercentage = [
    0, 5.5555547078450545, 5.5555547078450545, 8.888890584309909, 11.203704833984379, 19.259262084960945,
    19.259262084960945, 22.31481424967449, 22.31481424967449, 23.611109415690105, 23.611109415690105,
    25.833333333333336, 25.833333333333336, 28.88889058430991, 28.88889058430991, 30.925928751627612,
    30.925928751627612, 35.55555725097657, 35.55555725097657, 38.51851908365886, 41.66666666666667, 45.000000000000014,
    48.33333333333335, 49.16666666666668, 52.77778116861981, 53.4259236653646, 56.666666666666686, 62.40740966796876,
    63.703704833984396, 68.79629516601565, 78.88889567057292, 84.44444783528648, 88.33333333333336, 91.85185750325523,
    95.5555623372396, 100.0,
  ].sort();
  const chargingSpeed = [
    9.519585682518105, 21.975090261502675, 21.975090261502675, 227.0462701063418, 241.2811394639762, 248.39857414279336,
    248.39857414279336, 247.06406277669703, 247.06406277669703, 245.72953919270967, 245.72953919270967,
    248.8434153374558, 248.8434153374558, 248.39857414279336, 248.39857414279336, 244.3950156087223, 244.3950156087223,
    243.50534543728847, 243.50534543728847, 240.83629826931374, 247.50890397135947, 243.95017441405986,
    232.38434000650918, 216.81494706488746, 196.3523131998698, 175.4448503580807, 146.9750872070299, 145.6405758409336,
    120.28468883462892, 94.48399728733496, 95.37367967665983, 50.889682389324875, 29.982207329644762,
    12.633461827264249, 10.854097048614449, 9.964414659289524,
  ];

  // rescale chargingSpeed to a percentage
  const minSpeed = Math.min(...chargingSpeed);
  const maxSpeed = Math.max(...chargingSpeed);
  const chargingSpeedPercentage = chargingSpeed.map((e) => (e - minSpeed) / (maxSpeed - minSpeed));

  // So now we can find the closest indices to the current batteryPercentage
  const [i, ii] = findClosestValueIndices(batteryPercentage, Math.max(0, Math.min(100, currentBatteryPercentage)));

  // Now with that knowledge we can do a simple cosine-interpolation of the two values
  // http://paulbourke.net/miscellaneous/interpolation/
  const mu = (currentBatteryPercentage - batteryPercentage[i]) / (batteryPercentage[ii] - batteryPercentage[i]);
  const y1 = chargingSpeedPercentage[i];
  const y2 = chargingSpeedPercentage[ii];

  // const mu2 = (1-Math.cos(mu*Math.PI))/2;
  // return (y1*(1-mu2)) + (y2*mu2)
  return cosineInterpolation(y1, y2, mu);
};

/* API-Call */

export const getEnergyUsage = async (
  userId: string,
  minimumStateOfCharge: number,
  range: TimeRange,
): Promise<APIResponse<EnergyUsageInfo>> => {
  const timesteps = getTimeSteps(range);
  const unitInMs = unitToMs(range.unit);
  const hoursInMs = unitToMs('hours');

  // Decide on a Battery Capacity of the vehicle and initial state of charge
  const batteryCapacityKWh = Math.random() * (EVBatteryCapacityMax - EVBatteryCapacityMin) + EVBatteryCapacityMin;
  let currentBatteryPercentage = Math.random() * 0.8 + 0.2;

  // Decide on a random charger speed
  const chargerSpeed = ChargingSpeeds[Math.floor(Math.random() * ChargingSpeeds.length)];

  // Decide on a random amount of kilometers driven per year
  const kmPerYear =
    Math.random() * (maxKilometersDrivenPerYear - minKilometersDrivenPerYear) + minKilometersDrivenPerYear;
  const kmPerMs = kmPerYear / (12 * unitToMs('months'));

  // Set the required timesteps, so we have enough 'resolution' to model the charging behavior correctly
  // This means, that we cannot fill more than 10% of the battery per timestep, so we get appropriate control
  const simulationStepsPerTimestep = Math.ceil(unitInMs / ((batteryCapacityKWh / chargerSpeed) * 0.1 * hoursInMs));
  const simulationTimeStepMs = unitInMs / simulationStepsPerTimestep;

  // console.log(unitInMs, simulationTimeStepMs)

  // Run a quick simulation for each of the timesteps separately
  // This is easier than averaging later
  const timeseries: EnergyUsageTimestep[] = [];
  for (const ts of timesteps) {
    // TODO! we can incorporate rough statistics about energy mix here as well
    // and then do opportunistic charging based on that, to get a better than average mix

    const batteryIn = currentBatteryPercentage;
    let charged = 0;
    let discharged = 0;
    let averageChargingEnergyMix: EnergyMix | null = null;

    // Do the simulation substeps
    for (let i = 0; i < simulationStepsPerTimestep; i++) {
      // Get the current energy mix
      const currentTimestamp = moment(ts).valueOf() + i * simulationTimeStepMs;
      const currentEnergyMix = getCurrentEnergyMix(currentTimestamp);
      const simpleEnergyMix = energyMixToSimple(currentEnergyMix);

      // Based on the relation of the current mix to the average
      // mix, we can calculate a weight to prefer charging, to opportunistically take in energy
      // We're using sigmoid to shape the decision curvbe
      const chargingWeight = Math.max(
        0,
        sigmoid(
          simpleEnergyMix[SimpleEnergyProducerType.Renewable] -
            SimpleAveragePowerMix[SimpleEnergyProducerType.Renewable],
          10,
        ),
      );

      // No matter what we do, we need to calculate the current charge/discharge rate
      const chargeRateKw = Math.min(
        estimateChargingSpeedPercentage(currentBatteryPercentage * 100) * EVMaxChargingSpeedKw,
        chargerSpeed,
      );
      // (ms/step) / (ms/h) * (kw)= (h/step) * (kw) = (kwh/step)
      const chargeRateTimestepKWh = (simulationTimeStepMs / hoursInMs) * chargeRateKw;
      const chargeRateBatteryPercentage = chargeRateTimestepKWh / batteryCapacityKWh;

      // If the current percentage is < than the user selected min, we need to charge
      // The + chargeRateBatteryPercentage is so that we don't discharging below the user-set minimum
      if (currentBatteryPercentage + chargeRateBatteryPercentage < minimumStateOfCharge) {
        currentBatteryPercentage += chargeRateBatteryPercentage;
        charged += chargeRateTimestepKWh;
        averageChargingEnergyMix = addEnergyMix(
          currentEnergyMix,
          averageChargingEnergyMix,
          chargeRateBatteryPercentage,
        );
        continue;
      }

      // Decide based on the current energy mix, if we want to continue charging
      if (Math.random() < chargingWeight) {
        // Continue charging

        // If the battery goes over 100%, we need to limit it back and re-calculate the actual power
        if (currentBatteryPercentage + chargeRateBatteryPercentage > 1.0) {
          currentBatteryPercentage = 1.0;
          charged += (1.0 - currentBatteryPercentage) * batteryCapacityKWh;
          averageChargingEnergyMix = addEnergyMix(
            currentEnergyMix,
            averageChargingEnergyMix,
            1.0 - currentBatteryPercentage,
          );
        } else {
          currentBatteryPercentage += chargeRateBatteryPercentage;
          charged += chargeRateTimestepKWh;
          averageChargingEnergyMix = addEnergyMix(
            currentEnergyMix,
            averageChargingEnergyMix,
            chargeRateBatteryPercentage,
          );
        }
        continue;
      } else {
        currentBatteryPercentage -= chargeRateBatteryPercentage;
        discharged += chargeRateTimestepKWh;
        continue;
      }
    }

    // We also need to incoroporate driving here, which we only do, if the current capacity is > 15%
    // This is not entirely accuracte because this means we can 'charge' while we're driving, but solving that
    // is very annoying
    let usedKWh = 0;
    if (currentBatteryPercentage > 0.15 && Math.random() > 0.4) {
      const energyRequirementKWh = unitInMs * kmPerMs * kWhPerKm;
      // We however won't go lower than 5%
      const maximumEnergyUsableKWh = (currentBatteryPercentage - 0.05) * batteryCapacityKWh;

      usedKWh = Math.min(maximumEnergyUsableKWh, energyRequirementKWh);
      currentBatteryPercentage -= usedKWh / batteryCapacityKWh;
    }

    timeseries.push({
      batteryIn,
      chargedKWh: charged,
      usedKWh,
      chargingRateKW: charged / (hoursInMs / simulationTimeStepMs),
      dischargedKWh: discharged,
      dischargeRateKW: discharged / (hoursInMs / simulationTimeStepMs),
      batteryOut: currentBatteryPercentage,
      chargingMix: normalizeEnergyMix(averageChargingEnergyMix) ?? AveragePowerMix,
      timestamp: ts.toISOString(),
    });
  }

  // Return after timeout
  return resolveWithTimeout({
    status: 200,
    data: {
      total: totalEnergyUsage(timeseries),
      average: averageEnergyUsage(timeseries),
      timeseries,
      batteryCapacityKWh,
    },
  });
};

/* Hooks */

export const useEnergyUsage = (userId: string, minimumStateOfCharge: number, range: TimeRange) => {
  const [loading, setLoading] = useState(false);
  const [energyUsageInfo, setEnergyUsageInfo] = useState<EnergyUsageInfo | null>(null);
  const [error, setError] = useState<APIHookError | null>(null);
  const isMountedRef = useRef(false);

  const update = useCallback(() => {
    // TODO this is very generic, so we could make this a wrapper thingie
    setLoading(true);
    getEnergyUsage(userId, minimumStateOfCharge, range).then((val) => {
      if (!isMountedRef.current) return;
      setLoading(false);
      if (val.status !== 200) {
        setError(APIHookError.InvalidRequestError);
        setEnergyUsageInfo(null);
        return;
      }
      if (val.data == null) {
        setError(APIHookError.ServerSideError);
        setEnergyUsageInfo(null);
        return;
      }
      setError(null);
      setEnergyUsageInfo(val.data);
    });
  }, [userId, range]);

  useEffect(() => {
    isMountedRef.current = true;

    // Update on mount
    update();

    return () => {
      isMountedRef.current = false;
    };
  }, [update]);

  return {
    loading,
    error,
    energyUsageInfo,
    update,
  };
};
