/* 
This module contains utility functions to translate average CO2 usage into something more appropriate for users
It takes care of providing the required Icons as well.
*/
import { ReactComponent as AirplaneIcon } from 'assets/icons/material/airplane-takeoff.svg';
import { ReactComponent as BusIcon } from 'assets/icons/material/bus.svg';
import { ReactComponent as EVIcon } from 'assets/icons/material/car-electric.svg';
import { ReactComponent as CarIcon } from 'assets/icons/material/car.svg';
import { ReactComponent as TrainIcon } from 'assets/icons/material/train.svg';
import { ReactComponent as TreeIcon } from 'assets/icons/material/tree.svg';

// https://www.eea.europa.eu/articles/forests-health-and-climate-change/key-facts/trees-help-tackle-climate-change
// ~22Kg per tree, per year

// https://www.statista.com/statistics/1185559/carbon-footprint-of-travel-per-kilometer-by-mode-of-transport/
// in g/kilometer
// Only using a few good ones here
// flight - 255g
// car - 192g
// Bus - 105
// EV - average uk energy mix - 53g
// Train - 41

type SVGIcon = React.FC<React.SVGProps<SVGSVGElement>>;

const CO2SourceNames = ['Tree', 'Airplane', 'Car', 'Bus', 'EV', 'Train'] as const;
type CO2SourceType = (typeof CO2SourceNames)[number];

type EquivalentCO2StatisticInfo = {
  icon: SVGIcon;
  value: number;
  text: string;
  type: CO2SourceType;
};

const CO2SourceTypeUtilsMap: Record<CO2SourceType, (kg: number) => EquivalentCO2StatisticInfo> = {
  Tree: (value) => ({
    icon: TreeIcon,
    value: value / 22,
    text: 'Trees absorbing Co2 for one year',
    type: 'Tree',
  }),
  Airplane: (value) => ({
    icon: AirplaneIcon,
    value: value / 0.225,
    text: 'Km flight',
    type: 'Airplane',
  }),
  Car: (value) => ({
    icon: CarIcon,
    value: value / 0.192,
    text: 'Km driven (gasoline)',
    type: 'Car',
  }),
  Bus: (value) => ({
    icon: BusIcon,
    value: value / 0.105,
    text: 'Km driven',
    type: 'Bus',
  }),
  EV: (value) => ({
    icon: EVIcon,
    value: value / 0.053,
    text: 'Km driven (EV)',
    type: 'EV',
  }),
  Train: (value) => ({
    icon: TrainIcon,
    value: value / 0.041,
    text: 'KM driven',
    type: 'Train',
  }),
};

export const getCo2Statistics = (co2Kg: number): EquivalentCO2StatisticInfo[] => {
  // Calculate equivalents for each source:
  return (
    CO2SourceNames.map((name) => {
      return CO2SourceTypeUtilsMap[name](co2Kg);
    })
      // Filter out elements close to 0
      .filter((e) => e.value > 1)
  );
};
