import { oneWeeks } from "./token";

export const randomNumber = (minVal?: number, maxVal?: number) => {
  const min = minVal ?? 0;
  const max = maxVal ?? min;
  const rand = Math.floor(Math.random() * (max - min + 1)) + min;
  return rand;
};

export const randomDate = (startDate?: Date, endDate?: Date) => {
  const min = startDate ?? new Date();
  const minDate = min.getTime();
  const maxDate = (endDate ?? new Date(minDate + oneWeeks * 4 * 12)).getTime();
  const randomDate = minDate + Math.random() * (maxDate - minDate);
  return new Date(randomDate);
};

export const shortId = () => Math.random().toString(36).substring(2, 8);
