export const noClone = <T>(...arr: T[][]) => {
  const array = arr.flatMap((arr) => arr);
  return [...new Set(array)];
};
