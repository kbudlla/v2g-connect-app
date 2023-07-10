export const leftPad = (val: string | number, amount: number, pad: string | number) =>
  (new Array(amount).fill(pad).join('') + val).slice(-amount);
