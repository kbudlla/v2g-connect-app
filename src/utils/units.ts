export const halfSpace = ' ';

// TODO: If we change this to { value, unit }, we can display the thing a lot better
// Because then we can display xxx unit / time-unit
export const formatKgValue = (co2Kg: number): string => {
  // kg
  if (co2Kg > 1) {
    return `${co2Kg.toFixed(0)}${halfSpace}kg`;
  }
  // g
  if (co2Kg > 0.001) {
    return `${(co2Kg * 1000).toFixed(0)}${halfSpace}g`;
  }
  // mg
  if (co2Kg > 0.000001) {
    return `${(co2Kg * 1000000).toFixed(0)}${halfSpace}mg`;
  }

  // For amounts this small we just give up :)
  return `0${halfSpace}mg`;
};

export const formatKgValueWithUnit = (co2Kg: number): { value: string; unit: string } => {
  // kg
  if (co2Kg > 1) {
    return {
      value: co2Kg.toFixed(0),
      unit: 'kg',
    };
  }
  // g
  if (co2Kg > 0.001) {
    return {
      value: (co2Kg * 1000).toFixed(0),
      unit: 'g',
    };
  }
  // mg
  if (co2Kg > 0.000001) {
    return {
      value: (co2Kg * 1000000).toFixed(0),
      unit: 'mg',
    };
  }

  // For amounts this small we just give up :)
  return {
    value: '',
    unit: 'kg',
  };
};

export const formatKWhValue = (kwh: number): string => {
  // kwh
  if (kwh > 1) {
    return `${kwh.toFixed(0)}${halfSpace}kWh`;
  }
  // wh
  if (kwh > 0.001) {
    return `${(kwh * 1000).toFixed(0)}${halfSpace}Wh`;
  }

  // For amounts this small we just give up :)
  return `0${halfSpace}kWh`;
};
