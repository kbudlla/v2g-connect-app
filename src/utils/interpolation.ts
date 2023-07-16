/* 
This function assumes that target is within the bounds of array, min <= target <= max
Otherwise it returns [-1, -1]
*/
export const findClosestValueIndices = (array: number[], target: number): [number, number] => {
  for (let i = 1; i < array.length; i++) {
    const currentValue = array[i];

    // We essentially just have to check if the current value is >= than the target
    if (currentValue >= target) {
      return [i - 1, i];
    }
  }

  return [-1, -1];
};

export const findClosestValueIndex = (array: number[], target: number): number => {
  let minDistance: number | null = null;
  let minIndex = 0;
  for (let i = 0; i < array.length; i++) {
    const currentValue = array[i];
    const distance = Math.abs(target - currentValue);

    if (minDistance == null) {
      minDistance = distance;
      minIndex = i;
      continue;
    }

    if (distance < minDistance) {
      minDistance = distance;
      minIndex = i;
    }
  }

  return minIndex;
};

type InterpolationFunction = (a: number, b: number, mu: number) => number;

/* expects mu to be between 0 and 1 */
export const cosineInterpolation: InterpolationFunction = (a: number, b: number, mu: number): number => {
  // http://paulbourke.net/miscellaneous/interpolation/
  const mu2 = (1 - Math.cos(mu * Math.PI)) / 2;
  return a * (1 - mu2) + b * mu2;
};

export const interpolateOverObject = <T extends Record<string, number>>(
  a: T,
  b: T,
  mu: number,
  func: InterpolationFunction,
): T => {
  const ret: Partial<T> = {};
  for (const key of Object.keys(a)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ret as any)[key] = func(a[key], b[key], mu);
  }
  return ret as T;
};
