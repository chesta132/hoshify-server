export const randomNumber = (minVal?: number, maxVal?: number) => {
  const min = minVal ?? 0;
  const max = maxVal ?? min;
  const rand = Math.floor(Math.random() * (max - min + 1)) + min;
  return rand;
};

export const randomDate = (startDate?: Date, endDate?: Date) => {
  const min = startDate ?? new Date();
  const minDate = min.getTime();
  const maxDate = (endDate ?? min).getTime();
  const randomDate = minDate + Math.random() * (maxDate - minDate);
  return new Date(randomDate);
};
