export const sigmoid = (x: number, scale = 1) => 1.0 / (1 + Math.pow(Math.E, -scale * x));
