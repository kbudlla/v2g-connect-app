import { estimateChargingSpeedPercentage, getMaximumChargingSpeed, getRandomChargingSpeed } from './chargingSpeed';
import { charginStationLocationToHumanHumanReadable, getRandomChargingStation } from './chargingStations';
import { generateReceipt } from './earnings';
import {
  AveragePowerMix,
  EnergyMix,
  SimpleAveragePowerMix,
  SimpleEnergyProducerType,
  addEnergyMix,
  energyMixToSimple,
  getCO2Emissions,
  getCurrentEnergyMix,
  normalizeEnergyMix,
  scaleEnergyMix,
} from './energyMix';
import { sigmoid } from './math';
import { RNG } from './rng';
import { TimeUnit, unitToMs } from './time';

import moment from 'moment';

export type DriverState = 'driving' | 'charging';

export type SimulationState = {
  stepIndex: number;
  substeps: number;
  timestepMs: number;
  rng: RNG;
  timestampStart: number;

  driverState: DriverState;

  batteryPercentage: number;
  maxChargerChargingSpeedKW: number;

  kilometersDriven: number;
  kilometersDrivenAverage: number;

  // Preferences
  lowBatteryThreshold: number;
  preferredBatteryPercentage: number;
  preferredAverageKilometers: number;

  // Vehicle Config
  maxVehicleChargingSpeedKW: number;
  vehicleBatteryCapacityKWh: number;

  // Statistics
  chargedKWh: number;
  dischargedKWh: number;
  usedKWh: number;
  averageEnergyMix: EnergyMix | null;

  // State for generating charging receipts
  lastChargedKWh: number;
  lastDischargedKWh: number;
  receipts: ChargingReceipt[];
};

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

export type ChargingReceipt = {
  chargedKWh: number;
  dischargedKWh: number;
  timestamp: string;
  // Maybe charging station -> but this would bind the simulation to the chargers
  // Doing this properly is pretty hard to do, since it requires simulating driving on a map and so on
  // And most importantly geo-filtering.
  // For now just a random location, sampled from the chargers
  location: string;

  chargingCost: number;
  earnings: number;
  totalCost: number;
};

/* Constants */

const msPerHour = unitToMs('hours');

// How much energy do we need per kilometer (just taking the average)
// https://www.entega.de/blog/elektroauto-verbrauch/#:~:text=Der%20durchschnittliche%20Verbrauch%20auf%20100,%E2%82%AC%20und%2011%2C60%20%E2%82%AC.
export const kWhPerKm = (16.7 + 30.9) / 200;

/* Utility functions */

const calculateChargingWeight = (currentMix: EnergyMix, useCO2Weight = false): number => {
  const weight = useCO2Weight
    ? getCO2Emissions(AveragePowerMix, 1) - getCO2Emissions(currentMix, 1)
    : energyMixToSimple(currentMix)[SimpleEnergyProducerType.Renewable] -
      SimpleAveragePowerMix[SimpleEnergyProducerType.Renewable];

  return Math.max(
    0,
    sigmoid(
      weight,
      // use more agressive scaling for co2, since the difference is smaller
      useCO2Weight ? 40 : 10,
    ),
  );
};

const calculateDischargingWeight = (currentMix: EnergyMix, useCO2Weight = false): number => {
  const weight = useCO2Weight
    ? getCO2Emissions(currentMix, 1) - getCO2Emissions(AveragePowerMix, 1)
    : SimpleAveragePowerMix[SimpleEnergyProducerType.Renewable] -
      energyMixToSimple(currentMix)[SimpleEnergyProducerType.Renewable];

  return Math.max(0, sigmoid(weight, 10));
};

/* Simulation Logic */

const simulateDriving = (state: SimulationState) => {
  // Hard to say, what this should be
  const speed = 100;
  const hoursPerTimestep = state.timestepMs / msPerHour;
  const kmDrivenPerTimestep = speed * hoursPerTimestep;
  const kWhUsedPerTimestep = kmDrivenPerTimestep * kWhPerKm;
  const batteryPercentUsedPerTimestep = kWhUsedPerTimestep / state.vehicleBatteryCapacityKWh;

  state.kilometersDriven += kmDrivenPerTimestep;
  state.batteryPercentage -= batteryPercentUsedPerTimestep;
  state.usedKWh += kWhUsedPerTimestep;
};
const simulateCharging = (state: SimulationState, timestamp: number) => {
  const useCO2Weight = true;

  // Get the current energy mix
  const currentEnergyMix = getCurrentEnergyMix(timestamp);

  // Based on the relation of the current mix to the average
  // mix, we can calculate a weight to prefer charging, to opportunistically take in energy
  // We're using sigmoid to shape the decision curve
  const chargingWeight = calculateChargingWeight(currentEnergyMix, useCO2Weight);
  const dischargingWeight = calculateDischargingWeight(currentEnergyMix, useCO2Weight);

  // Get speed for charging
  const chargingSpeedKW = Math.min(
    estimateChargingSpeedPercentage(state.batteryPercentage) * state.maxVehicleChargingSpeedKW,
    state.maxChargerChargingSpeedKW,
  );

  // And for discharging -> for now they're the same, but this is not entirely realistic
  const dischargeSpeedKW = chargingSpeedKW;

  // Calculate them as percentage changes, that's easier to deal with
  const chargeRateTimestepKWh = (state.timestepMs / msPerHour) * chargingSpeedKW;
  const dischargeRateTimestepKWh = (state.timestepMs / msPerHour) * dischargeSpeedKW;
  const chargeRateBatteryPercentage = chargeRateTimestepKWh / state.vehicleBatteryCapacityKWh;
  const dischargeRateBatteryPercentage = dischargeRateTimestepKWh / state.vehicleBatteryCapacityKWh;

  // If we're below the user-set threshold, we *must* charge
  if (state.batteryPercentage < state.preferredBatteryPercentage) {
    state.batteryPercentage += chargeRateBatteryPercentage;
    state.chargedKWh += chargeRateTimestepKWh;
    // Energy Mix
    if (!state.averageEnergyMix) {
      state.averageEnergyMix = scaleEnergyMix(currentEnergyMix, chargeRateBatteryPercentage);
    } else {
      state.averageEnergyMix = addEnergyMix(state.averageEnergyMix, currentEnergyMix, chargeRateBatteryPercentage);
    }
    return;
  }

  // Otherwise it's up to our algorithm to do what we want
  // Decide based on the current energy mix, if we want to charge or discharge
  // if (state.rng.float(0, 1) < chargingWeight) {

  // Estimate remaining charging time for a better estimate here?
  // Holdout if the conditions become better in the next n timesteps
  const lookahead = 15;
  const futureChargingWeight = Math.max(
    ...new Array(lookahead)
      .fill(0)
      .map((_, i) =>
        calculateChargingWeight(getCurrentEnergyMix(timestamp + (state.timestepMs + 1) * i), useCO2Weight),
      ),
  );
  const futureDischargingWeight = Math.max(
    ...new Array(lookahead)
      .fill(0)
      .map((_, i) =>
        calculateDischargingWeight(getCurrentEnergyMix(timestamp + (state.timestepMs + 1) * i), useCO2Weight),
      ),
  );

  const shouldChargeNow = chargingWeight > dischargingWeight && futureChargingWeight <= chargingWeight;

  const shouldDischargeNow = dischargingWeight > chargingWeight && futureDischargingWeight <= dischargingWeight;

  if (shouldChargeNow) {
    // If the battery goes over 100%, we need to limit it back and re-calculate the actual power
    if (state.batteryPercentage + chargeRateBatteryPercentage > 1.0) {
      state.chargedKWh += (1.0 - state.batteryPercentage) * state.vehicleBatteryCapacityKWh;
      state.batteryPercentage = 1.0;
      // Energy Mix
      if (!state.averageEnergyMix) {
        state.averageEnergyMix = scaleEnergyMix(currentEnergyMix, 1.0 - state.batteryPercentage);
      } else {
        state.averageEnergyMix = addEnergyMix(state.averageEnergyMix, currentEnergyMix, 1.0 - state.batteryPercentage);
      }
    } else {
      state.batteryPercentage += chargeRateBatteryPercentage;
      state.chargedKWh += chargeRateTimestepKWh;
      // Energy Mix
      if (!state.averageEnergyMix) {
        state.averageEnergyMix = scaleEnergyMix(currentEnergyMix, chargeRateBatteryPercentage);
      } else {
        state.averageEnergyMix = addEnergyMix(state.averageEnergyMix, currentEnergyMix, chargeRateBatteryPercentage);
      }
    }
    return;
  }

  if (shouldDischargeNow) {
    state.batteryPercentage -= dischargeRateBatteryPercentage;
    state.dischargedKWh += chargeRateTimestepKWh;
    return;
  }

  // Otherwise we stay idle
};

/* Updates the state in place */
export const simulateTimestep = (state: SimulationState) => {
  const timestamp = state.timestampStart + state.stepIndex * state.timestepMs;
  // Increment step-index
  state.stepIndex += 1;

  // Simulation logic
  switch (state.driverState) {
    case 'driving':
      simulateDriving(state);
      break;
    case 'charging':
      simulateCharging(state, timestamp);
      break;
  }

  // Update Averages
  // (Not numerically stable, but fine for the short timescales we're working with)
  state.kilometersDrivenAverage = state.kilometersDriven / state.stepIndex;

  // State transition logic
  switch (state.driverState) {
    case 'driving':
      // Stop driving if we either exceed the # of average kilometers
      // or -> if we hit our lowBatteryThreshold
      if (
        state.kilometersDrivenAverage > state.preferredAverageKilometers ||
        state.batteryPercentage <= state.lowBatteryThreshold
      ) {
        state.driverState = 'charging';
        // Select a new charger
        state.maxChargerChargingSpeedKW = getRandomChargingSpeed(state.rng);
      }
      break;
    case 'charging':
      // If we have exceeded our lowBatteryThreshold and need to drive, we start driving
      if (
        state.batteryPercentage >= state.lowBatteryThreshold &&
        state.kilometersDrivenAverage < state.preferredAverageKilometers
      ) {
        state.driverState = 'driving';

        // If we switch, we can generate a charging receipt
        const receipt = generateReceipt({
          chargedKWh: state.chargedKWh - state.lastChargedKWh,
          dischargedKWh: state.dischargedKWh - state.lastDischargedKWh,
          location: charginStationLocationToHumanHumanReadable(getRandomChargingStation(state.rng)),
          timestamp: new Date(timestamp).toISOString(),
        });
        state.receipts.push(receipt);
        state.lastChargedKWh = state.chargedKWh;
        state.lastDischargedKWh = state.dischargedKWh;
      }
      break;
  }
};

type SimulationParamters = {
  timeUnit: TimeUnit;
  timestampStart: number;
  // Simulation quality
  // used to determine the timesteps, such that the maximum battery % change <= this value
  quality?: number;
  rng: RNG;

  batteryCapacityKWh: number;
  batteryPercentage: number;
  preferredBatteryPercentage: number;
  maxVehicleChargingSpeedKW: number;
  preferredKmPerYear: number;
};

export const initializeSimulation = (parameters: SimulationParamters): SimulationState => {
  const {
    batteryCapacityKWh,
    batteryPercentage,
    preferredBatteryPercentage,
    maxVehicleChargingSpeedKW,
    rng,
    timestampStart,
  } = parameters;
  const unitInMs = unitToMs(parameters.timeUnit);

  // Set the required timesteps, so we have enough 'resolution' to model the charging behavior correctly
  // This means, that we cannot fill more than <quality>% of the battery per timestep, so we get appropriate control
  const quality = parameters.quality ?? 0.1;
  const substeps = Math.max(
    // Based on charging speed (kWh per time-unit cannot be larger than quality% battery)
    Math.ceil((getMaximumChargingSpeed() * (unitInMs / msPerHour)) / (batteryCapacityKWh * quality)),
    // Based on driving load (kWh per time-unit while driving cannot be larger than quality% battery)
    Math.ceil((kWhPerKm * 35 * (unitInMs / msPerHour)) / (batteryCapacityKWh * quality)),
  );
  const timestepMs = unitInMs / substeps;

  const preferredAverageKilometers = timestepMs * (parameters.preferredKmPerYear / (12 * unitToMs('months')));

  const state: SimulationState = {
    stepIndex: 0,
    timestampStart,
    substeps,
    timestepMs,
    rng,

    // Start off in charging mode, by default
    driverState: 'charging',

    batteryPercentage,
    maxChargerChargingSpeedKW: getRandomChargingSpeed(rng),

    kilometersDriven: 0,
    kilometersDrivenAverage: 0,

    lowBatteryThreshold: 0.15,
    preferredBatteryPercentage,
    preferredAverageKilometers,

    maxVehicleChargingSpeedKW,
    vehicleBatteryCapacityKWh: batteryCapacityKWh,

    chargedKWh: 0,
    usedKWh: 0,
    dischargedKWh: 0,
    averageEnergyMix: null,

    lastChargedKWh: 0,
    lastDischargedKWh: 0,
    receipts: [],
  };

  return state;
};

export const initializeSimulationWithPrerun = (parameters: SimulationParamters, timesteps = 8): SimulationState => {
  const timestampStart = moment(parameters.timestampStart)
    .subtract(timesteps - 1, parameters.timeUnit)
    .valueOf();
  const preRunState = initializeSimulation({
    ...parameters,
    timestampStart,
  });

  for (let i = 0; i < timesteps; i++) {
    runSimulationStep(preRunState);
  }
  console.log(timestampStart + (preRunState.stepIndex + 1) * preRunState.timestepMs, parameters.timestampStart);

  // const state = initializeSimulation(parameters)
  // console.log(preRunState, state)
  return preRunState;
};

export const runSimulationStep = (state: SimulationState) => {
  const batteryIn = state.batteryPercentage;

  const timestamp = new Date(state.timestampStart + state.stepIndex * state.timestepMs);

  // Run the simulation substeps
  for (let i = 0; i < state.substeps; i++) {
    simulateTimestep(state);
  }

  // Export statistics
  const statistics: EnergyUsageTimestep = {
    batteryIn,
    chargedKWh: state.chargedKWh,
    usedKWh: state.usedKWh,
    chargingRateKW: state.chargedKWh / (msPerHour / state.timestepMs),
    dischargedKWh: state.dischargedKWh,
    dischargeRateKW: state.dischargedKWh / (msPerHour / state.timestepMs),
    batteryOut: state.batteryPercentage,
    chargingMix: normalizeEnergyMix(state.averageEnergyMix) ?? AveragePowerMix,
    timestamp: timestamp.toISOString(),
  };
  const receipts = [...state.receipts];

  // Reset running statistics
  // state.stepIndex = 0;
  state.averageEnergyMix = null;
  state.chargedKWh = 0;
  state.dischargedKWh = 0;
  state.usedKWh = 0;
  // state.kilometersDriven = 0;
  // state.kilometersDrivenAverage = 0;
  state.lastChargedKWh = 0;
  state.lastDischargedKWh = 0;
  state.receipts = [];

  return {
    statistics,
    receipts,
  };
};
