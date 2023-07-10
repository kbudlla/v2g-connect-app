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
