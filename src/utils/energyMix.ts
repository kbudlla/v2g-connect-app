// Energy sources and their overall percentages:
// https://www.destatis.de/EN/Themes/Economic-Sectors-Enterprises/Energy/Production/Tables/gross-electricity-production.html
// Values for 2022
// Maybe we don't need fancy mocks:
// https://www.energy-charts.info/charts/power/chart.htm?l=de&c=DE
import { cosineInterpolation, findClosestValueIndices, interpolateOverObject } from './interpolation';

import EnergyMixData from 'assets/data/energyMix2023Kw11.json';
import moment from 'moment';

/* Typing */

export enum EnergyProducerType {
  // Lignite + Hard Coal
  Coal = 'Coal',
  Nuclear = 'Nuclear',
  Gas = 'Gas',
  Oil = 'Oil',
  Wind = 'Wind',
  Water = 'Water',
  Biomass = 'Biomass',
  Photovoltaic = 'Photovoltaic',
  Waste = 'Waste',
  Geothermal = 'Geothermal',
  Other = 'Other',
}

export enum SimpleEnergyProducerType {
  // Lignite + Hard Coal
  Coal = 'Coal',
  Nuclear = 'Nuclear',
  Gas = 'Gas',
  Oil = 'Oil',
  Other = 'Other',
  Renewable = 'Renewable',
}

// Yes, yes these are required for the mappings
export const EnergyProducerTypes = [
  EnergyProducerType.Coal,
  EnergyProducerType.Nuclear,
  EnergyProducerType.Gas,
  EnergyProducerType.Oil,
  EnergyProducerType.Wind,
  EnergyProducerType.Water,
  EnergyProducerType.Biomass,
  EnergyProducerType.Photovoltaic,
  EnergyProducerType.Waste,
  EnergyProducerType.Geothermal,
  EnergyProducerType.Other,
] as const;

export const SimpleEnergyProducerTypes = [
  SimpleEnergyProducerType.Coal,
  SimpleEnergyProducerType.Nuclear,
  SimpleEnergyProducerType.Gas,
  SimpleEnergyProducerType.Oil,
  SimpleEnergyProducerType.Renewable,
  SimpleEnergyProducerType.Other,
] as const;

export type EnergyMix = Record<EnergyProducerType, number>;
export type SimpleEnergyMix = Record<SimpleEnergyProducerType, number>;

/* Conversion functions */

export const producerTypeToSimple = (type: EnergyProducerType | string): SimpleEnergyProducerType | null => {
  switch (type) {
    case EnergyProducerType.Coal:
      return SimpleEnergyProducerType.Coal;
    case EnergyProducerType.Nuclear:
      return SimpleEnergyProducerType.Nuclear;
    case EnergyProducerType.Gas:
      return SimpleEnergyProducerType.Gas;
    case EnergyProducerType.Oil:
      return SimpleEnergyProducerType.Oil;
    case EnergyProducerType.Other:
      return SimpleEnergyProducerType.Other;
    case EnergyProducerType.Wind:
    case EnergyProducerType.Water:
    case EnergyProducerType.Biomass:
    case EnergyProducerType.Photovoltaic:
    case EnergyProducerType.Waste:
    case EnergyProducerType.Geothermal:
      return SimpleEnergyProducerType.Renewable;
  }
  return null;
};

export const energyMixToSimple = <T extends EnergyMix>(mix: T): SimpleEnergyMix => {
  const simpleMix: Partial<SimpleEnergyMix> = {};
  for (const key of EnergyProducerTypes) {
    const simpleKey = producerTypeToSimple(key as unknown as EnergyProducerType);
    // This may happen, because T can contain keys which are not casteable to a simpleProducer
    if (simpleKey == null) continue;
    if (simpleMix[simpleKey] == null) {
      simpleMix[simpleKey] = 0;
    }
    // Typescript is being stupid
    (simpleMix as SimpleEnergyMix)[simpleKey] += mix[key as unknown as EnergyProducerType];
  }
  return simpleMix as SimpleEnergyMix;
};

export const isRenewable = (type: EnergyProducerType): boolean => {
  return producerTypeToSimple(type) === SimpleEnergyProducerType.Renewable;
};

export const scaleEnergyMix = (mix: EnergyMix, factor: number): EnergyMix => {
  return EnergyProducerTypes.reduce((combined, key) => {
    combined[key] = mix[key] * factor;
    return combined;
  }, {} as Partial<EnergyMix>) as EnergyMix;
};

export const addEnergyMix = (a: EnergyMix, b: EnergyMix | null, weight = 1): EnergyMix => {
  if (!b) return scaleEnergyMix(a, weight);
  return EnergyProducerTypes.reduce((combined, key) => {
    combined[key] = a[key] + b[key] * weight;
    return combined;
  }, {} as Partial<EnergyMix>) as EnergyMix;
};

export const normalizeEnergyMix = (mix: EnergyMix | null): EnergyMix | null => {
  if (!mix) return null;
  const total = EnergyProducerTypes.reduce((total, key) => total + mix[key], 0);
  return scaleEnergyMix(mix, 1 / total);
};

/* Constants */

/* Access to resamples values from the energy mix */

export const EnergyMixTimeSeries: (EnergyMix & { timestamp: number })[] = EnergyMixData.map((element) => {
  // First, rename/map the fields into something more readable
  const timestamp = moment(element['Datum (MEZ)']).valueOf();

  // Parse them into a proper mix, normalization is handled below
  const mix: EnergyMix = {
    [EnergyProducerType.Coal]: element.Braunkohle + element.Steinkohle,
    [EnergyProducerType.Nuclear]: element.Kernenergie,
    [EnergyProducerType.Gas]: element.Erdgas,
    [EnergyProducerType.Oil]: element['Öl'],
    [EnergyProducerType.Wind]: element['Wind Offshore'] + element['Wind Onshore'],
    [EnergyProducerType.Water]: element.Laufwasser + element.Speicherwasser,
    [EnergyProducerType.Biomass]: element.Biomasse,
    [EnergyProducerType.Photovoltaic]: element.Solar,
    [EnergyProducerType.Waste]: element['Müll'],
    [EnergyProducerType.Geothermal]: element.Geothermie,
    [EnergyProducerType.Other]: element.Andere,
  };

  return { timestamp, ...normalizeEnergyMix(mix) };
}).sort((a, b) => a.timestamp - b.timestamp) as (EnergyMix & { timestamp: number })[];
const EnergyMixTimeSeriesStart = Math.min(...EnergyMixTimeSeries.map((e) => e.timestamp));
const EnergyMixTimeSeriesEnd = Math.max(...EnergyMixTimeSeries.map((e) => e.timestamp));
const EnergyMixTimeSeriesTimeDelta = EnergyMixTimeSeriesEnd - EnergyMixTimeSeriesStart;

// Because JS's module is broken
const modulo = (n: number, m: number) => ((n % m) + m) % m;

export const getCurrentEnergyMix = (timestamp: number): EnergyMix => {
  // First, we re-map the timestamp into the time-series we have
  // Not 100% sure if we have to subtract the EnergyMixTimeSeriesStart and add it back, but I think yes
  const localTimestamp =
    modulo(Math.floor(timestamp - EnergyMixTimeSeriesStart), EnergyMixTimeSeriesTimeDelta) + EnergyMixTimeSeriesStart;

  // Find the two closest values
  const [i, ii] = findClosestValueIndices(
    EnergyMixTimeSeries.map((e) => e.timestamp),
    localTimestamp,
  );

  // And interpolate between them:
  const mix = interpolateOverObject(
    EnergyMixTimeSeries[i],
    EnergyMixTimeSeries[ii],
    (localTimestamp - EnergyMixTimeSeries[i].timestamp) /
      (EnergyMixTimeSeries[ii].timestamp - EnergyMixTimeSeries[i].timestamp),
    cosineInterpolation,
  );

  // This is fine, because it cannot be null
  return mix as EnergyMix;
};

// See above, 2022 values
export const AveragePowerMix: EnergyMix = {
  [EnergyProducerType.Coal]: 0.311,
  [EnergyProducerType.Nuclear]: 0.06,
  [EnergyProducerType.Gas]: 0.138,
  [EnergyProducerType.Oil]: 0.008,
  [EnergyProducerType.Wind]: 0.217,
  [EnergyProducerType.Water]: 0.03,
  [EnergyProducerType.Biomass]: 0.077,
  [EnergyProducerType.Photovoltaic]: 0.105,
  [EnergyProducerType.Waste]: 0.01,
  [EnergyProducerType.Geothermal]: 0.0,
  // This value was 4.2%, but with that this didn't add up to 1
  [EnergyProducerType.Other]: 0.044,
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
// export const AveragePowerMix = normalizeEnergyMix((EnergyMixTimeSeries as EnergyMix[]).reduce((total, e) => addEnergyMix(total, e)))!

export const SimpleAveragePowerMix = energyMixToSimple(AveragePowerMix);

/* PowerMix to CO2 emissions */
// https://www.bundestag.de/resource/blob/406432/c4cbd6c8c74ec40df8d9cda8fe2f7dbb/WD-8-056-07-pdf-data.pdf
export const CO2PerKWhProducerMap: Record<EnergyProducerType, number> = {
  // Eyeball-average levels of statistics
  [EnergyProducerType.Coal]: 1.02,
  [EnergyProducerType.Nuclear]: 0.0195,
  [EnergyProducerType.Gas]: 0.64,
  [EnergyProducerType.Oil]: 0.89,
  [EnergyProducerType.Wind]: 0.012,
  [EnergyProducerType.Water]: 0.0085,
  // IDK about this one chief
  [EnergyProducerType.Biomass]: -0.409,
  [EnergyProducerType.Photovoltaic]: 0.12,
  // https://www.hamburger-energietisch.de/WP-Server/wp-content/uploads/2019/02/Bilanzierung-von-CO2-aus-M%C3%BCllverbrennungsanlagen-in-Hamburg.pdf
  // Average of industrial/residential waste, 1:1
  [EnergyProducerType.Waste]: 0.29268,
  // https://www.tech-for-future.de/co2-kwh-strom/
  [EnergyProducerType.Geothermal]: 0.038,
  [EnergyProducerType.Other]: 0.044,
};

export const getCO2Emissions = (mix: EnergyMix, kWh: number): number => {
  return EnergyProducerTypes.map((type) => mix[type] * kWh * CO2PerKWhProducerMap[type]).reduce(
    (total, e) => total + e,
  );
};
