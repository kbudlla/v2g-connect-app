import { RNG } from './rng';

import chargingStations from 'assets/data/chargingStationsBNE.json';

// Typing
export type ChargingStationChargerInfo = {
  capacity: number;
  connectorTypes: ChargingStationConnectorType[];
  publicKey: string;
};

export type ChargingStation = {
  operator: string;
  location: ChargingStationLocation;
  commissioningDate: string;
  totalCapacity: string;
  type: string;
  chargerCount: number;
  chargerInfo: ChargingStationChargerInfo[];
};

export type ChargingStationLocation = {
  street: string;
  number: string;
  supplement: string;
  city: string;
  district: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
};

export type ChargingStationConnectorType =
  | 'Type2'
  | 'CCS'
  | 'CHAdeMO'
  | 'Schuko'
  | 'CEE'
  | 'CEE3Pin'
  | 'CEE5Pin'
  | 'Tesla'
  | 'Type2Tesla';

export const ChargingStations = chargingStations as unknown as ChargingStation[];

export const getRandomChargingStation = (rng?: RNG) => {
  return rng ? rng.choice(ChargingStations) : ChargingStations[Math.floor(Math.random() * ChargingStations.length)];
};

export const charginStationLocationToHumanHumanReadable = (station: ChargingStation) => {
  return `${station.location.street} ${station.location.number}, ${station.location.zipCode} ${station.location.city}`;
};
