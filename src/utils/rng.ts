import prand from 'pure-rand';

export class RNG {
  _rng: prand.RandomGenerator;
  constructor(seed: number) {
    this._rng = prand.xoroshiro128plus(seed);
  }

  int(min: number, max: number) {
    return prand.unsafeUniformIntDistribution(min, max, this._rng);
  }

  float(min: number, max: number) {
    const diff = max - min;
    return (this.int(0, Number.MAX_SAFE_INTEGER) / Number.MAX_SAFE_INTEGER) * diff + min;
  }

  choice<T>(array: T[]): T {
    const index = this.int(0, array.length - 1);
    return array[index];
  }
}
