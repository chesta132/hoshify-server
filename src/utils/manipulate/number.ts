export type CharOptions = {
  fontSize: number;
  fontFamily?: "Manrope" | "Inter" | (string & {});
  text: string;
};

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;

export const getMaxChar = (width: number, { fontSize, fontFamily = "Manrope", text }: CharOptions) => {
  ctx.font = `${fontSize}px ${fontFamily}, sans-serif`;

  let low = 0;
  let high = text.length - 1;
  let result = 0;

  while (low <= high) {
    const mid = (low + high) >> 1;
    const measured = ctx.measureText(text.slice(0, mid + 1)).width;

    if (measured <= width) {
      result = mid + 1;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return result;
};

type TimeInMsProps = {
  second?: number;
  minute?: number;
  hour?: number;
  day?: number;
  month?: number;
  year?: number;
};

export const timeInMs = ({ second = 0, minute = 0, hour = 0, day = 0, month = 0, year = 0 }: TimeInMsProps) => {
  const factors = {
    second: 1000,
    minute: 1000 * 60,
    hour: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
    month: 1000 * 60 * 60 * 24 * 30,
    year: 1000 * 60 * 60 * 24 * 30 * 12,
  };

  return second * factors.second + minute * factors.minute + hour * factors.hour + day * factors.day + month * factors.month + year * factors.year;
};
