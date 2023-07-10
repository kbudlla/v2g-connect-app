export const resolveWithTimeout = <T>(value: T, timeout = 500): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), timeout);
  });
};
