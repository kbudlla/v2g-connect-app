import { estimateChargingSpeedPercentage, getMaximumChargingSpeed, getRandomChargingSpeed } from './chargingSpeed';
import {
  AveragePowerMix,
  EnergyMix,
  SimpleAveragePowerMix,
  SimpleEnergyMix,
  SimpleEnergyProducerType,
  addEnergyMix,
  energyMixToSimple,
  getCurrentEnergyMix,
  normalizeEnergyMix,
  scaleEnergyMix,
} from './energyMix';
import { sigmoid } from './math';
import { TimeUnit, unitToMs } from './time';

export type DriverState = 'driving' | 'charging';

export type SimulationState = {
  stepIndex: number;
  substeps: number;
  timestepMs: number;

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

/* Constants */

const msPerHour = unitToMs('hours');

// How much energy do we need per kilometer (just taking the average)
// https://www.entega.de/blog/elektroauto-verbrauch/#:~:text=Der%20durchschnittliche%20Verbrauch%20auf%20100,%E2%82%AC%20und%2011%2C60%20%E2%82%AC.
export const kWhPerKm = (16.7 + 30.9) / 200;

/* Utility functions */

const calculateChargingWeight = (currentMix: SimpleEnergyMix): number => {
  return Math.max(
    0,
    sigmoid(
      currentMix[SimpleEnergyProducerType.Renewable] - SimpleAveragePowerMix[SimpleEnergyProducerType.Renewable],
      10,
    ),
  );
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
  // Get the current energy mix
  const currentTimestamp = timestamp + state.stepIndex * state.timestepMs;
  const currentEnergyMix = getCurrentEnergyMix(currentTimestamp);
  const simpleEnergyMix = energyMixToSimple(currentEnergyMix);

  // Based on the relation of the current mix to the average
  // mix, we can calculate a weight to prefer charging, to opportunistically take in energy
  // We're using sigmoid to shape the decision curvbe
  const chargingWeight = calculateChargingWeight(simpleEnergyMix);

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
  // TODO! this is not a great way to decide this.
  if (Math.random() < chargingWeight) {
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

  // If we get here, we're discharging
  state.batteryPercentage -= dischargeRateBatteryPercentage;
  state.dischargedKWh += chargeRateTimestepKWh;
};

/* Updates the state in place */
export const simulateTimestep = (state: SimulationState, timestamp: number) => {
  // Increment step-index
  state.stepIndex += 1;
  // console.log(state.driverState)

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
        state.maxChargerChargingSpeedKW = getRandomChargingSpeed();
      }
      break;
    case 'charging':
      // If we have exceeded our lowBatteryThreshold and need to drive, we start driving
      if (
        state.batteryPercentage >= state.lowBatteryThreshold &&
        state.kilometersDrivenAverage < state.preferredAverageKilometers
      ) {
        state.driverState = 'driving';
      }
      break;
  }
};

type SimulationParamters = {
  timeUnit: TimeUnit;
  // Simulation quality
  // used to determine the timesteps, such that the maximum battery % change <= this value
  quality?: number;

  batteryCapacityKWh: number;
  batteryPercentage: number;
  preferredBatteryPercentage: number;
  maxVehicleChargingSpeedKW: number;
  preferredKmPerYear: number;
};

export const initializeSimulation = (parameters: SimulationParamters): SimulationState => {
  const { batteryCapacityKWh, batteryPercentage, preferredBatteryPercentage, maxVehicleChargingSpeedKW } = parameters;
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

  return {
    stepIndex: 0,
    substeps,
    timestepMs,

    // Start off in charging mode, by default
    driverState: 'charging',

    batteryPercentage,
    maxChargerChargingSpeedKW: getRandomChargingSpeed(),

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
  };
};

export const runSimulationStep = (state: SimulationState, timestep: Date) => {
  const batteryIn = state.batteryPercentage;

  // Run the simulation substeps
  const initialTimestamp = timestep.getTime();
  for (let i = 0; i < state.substeps; i++) {
    simulateTimestep(state, initialTimestamp + i * state.timestepMs);
  }

  // Export statistics
  const timestampStatistics: EnergyUsageTimestep = {
    batteryIn,
    chargedKWh: state.chargedKWh,
    usedKWh: state.usedKWh,
    chargingRateKW: state.chargedKWh / (msPerHour / state.timestepMs),
    dischargedKWh: state.dischargedKWh,
    dischargeRateKW: state.dischargedKWh / (msPerHour / state.timestepMs),
    batteryOut: state.batteryPercentage,
    chargingMix: normalizeEnergyMix(state.averageEnergyMix) ?? AveragePowerMix,
    timestamp: timestep.toISOString(),
  };

  console.log(state.kilometersDriven);

  // Reset running statistics
  state.stepIndex = 0;
  state.averageEnergyMix = null;
  state.chargedKWh = 0;
  state.dischargedKWh = 0;
  state.usedKWh = 0;
  state.kilometersDriven = 0;
  state.kilometersDrivenAverage = 0;

  return timestampStatistics;
};
