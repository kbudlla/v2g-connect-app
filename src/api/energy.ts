//
import { useCallback, useEffect, useRef, useState } from 'react';

import { APIHookError, APIResponse } from './types';

import { EnergyMix, addEnergyMix, normalizeEnergyMix } from 'utils/energyMix';
import { resolveWithTimeout } from 'utils/mock';
import { RNG } from 'utils/rng';
import { ChargingReceipt, EnergyUsageTimestep, initializeSimulation, runSimulationStep } from 'utils/simulation';
import { TimeRange, getTimeSteps } from 'utils/time';

import * as Comlink from 'comlink';

type EnergyUsageStats = Omit<EnergyUsageTimestep, 'batteryIn' | 'batteryOut' | 'timestamp'>;

export type EnergyUsageInfo = {
  average: EnergyUsageStats;
  total: Omit<EnergyUsageStats, 'chargingRateKW' | 'dischargeRateKW' | 'chargingMix'>;
  timeseries: EnergyUsageTimestep[];
  batteryCapacityKWh: number;
  receipts: ChargingReceipt[];
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
  const dischargedKWh = timeseries.reduce((acc, e) => acc + e.dischargedKWh, 0);
  const usedKWh = timeseries.reduce((acc, e) => acc + e.usedKWh, 0);

  return {
    chargedKWh,
    dischargedKWh,
    usedKWh,
  };
};

/* Constants */

// Battery capacities in kWh
// https://ev-database.org/cheatsheet/useable-battery-capacity-electric-car
const EVBatteryCapacityMin = 21.3;
const EVBatteryCapacityMax = 123.0;

// Random value, in kW
// The idea is that we're often limited by the charger and the battery related effect only kicks
// in when the maximum-rating of the car is < than what the charger can supply
const EVMaxChargingSpeedKw = 50;

// https://www.odyssee-mure.eu/publications/efficiency-by-sector/transport/distance-travelled-by-car.html
const minKilometersDrivenPerYear = 8400;
const maxKilometersDrivenPerYear = 13000;

/* API-Call */

export const getEnergyUsage = async (
  userId: string,
  minimumStateOfCharge: number,
  range: TimeRange,
): Promise<APIResponse<EnergyUsageInfo>> => {
  // const rng = new RNG(42069)

  // const timesteps = getTimeSteps(range);

  // // Decide on a Battery Capacity of the vehicle and initial state of charge
  // const batteryCapacityKWh = rng.float(EVBatteryCapacityMin, EVBatteryCapacityMax)
  // const initialBatteryPercentage = rng.float(0.2, 1.0);

  // // Decide on a random amount of kilometers driven per year
  // const kmPerYear = rng.float(minKilometersDrivenPerYear, maxKilometersDrivenPerYear);

  // // Run a quick simulation for each of the timesteps separately
  // // This is easier than averaging later
  // const timeseries: EnergyUsageTimestep[] = [];
  // let receipts: ChargingReceipt[] = [];
  // const state = initializeSimulation({
  //   batteryCapacityKWh,
  //   batteryPercentage: initialBatteryPercentage,
  //   maxVehicleChargingSpeedKW: EVMaxChargingSpeedKw,
  //   preferredBatteryPercentage: minimumStateOfCharge,
  //   preferredKmPerYear: kmPerYear,
  //   timeUnit: range.unit,
  //   quality: 0.05,
  //   rng,
  //   timestampStart: range.from.getTime()
  // });
  // for (const _ of timesteps) {
  //   const timestep = runSimulationStep(state);
  //   timeseries.push(timestep.statistics);
  //   receipts = receipts.concat(timestep.receipts);
  // }

  const instance = new ComlinkWorker<typeof import('./workers/simulation')>(
    new URL('./workers/simulation', import.meta.url),
  );
  const result = await instance.getEnergyUsage(userId, minimumStateOfCharge, range);

  // Return after timeout
  return {
    status: 200,
    data: result,
  };
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
