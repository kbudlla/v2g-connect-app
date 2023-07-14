// Charging speed depends on the state of charge of the battery
// https://www.allego.eu/blog/2022/june/what-variables-affect-your-charging-speed
import { cosineInterpolation, findClosestValueIndices } from './interpolation';
import { RNG } from './rng';

// And https://plotdigitizer.com/
export const estimateChargingSpeedPercentage = (currentBatteryPercentage: number): number => {
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
  ]
    .map((e) => e / 100)
    .sort((a, b) => a - b);
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

// Charging speeds in kW
// https://de.wikipedia.org/wiki/Ladestation_(Elektrofahrzeug)
export const ChargingSpeeds = [3.6, 5.8, 7.2, 11] as const;

export const getRandomChargingSpeed = (rng?: RNG) => {
  return rng ? rng.choice([...ChargingSpeeds]) : ChargingSpeeds[Math.floor(Math.random() * ChargingSpeeds.length)];
};
export const getMaximumChargingSpeed = () => Math.max(...ChargingSpeeds);
