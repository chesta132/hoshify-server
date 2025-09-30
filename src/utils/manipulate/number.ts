type TimeInMsProps = {
  second?: number;
  minute?: number;
  hour?: number;
  day?: number;
  week?: number;
  month?: number;
  year?: number;
};

export const timeInMs = ({ second = 0, minute = 0, hour = 0, day = 0, week = 0, month = 0, year = 0 }: TimeInMsProps) => {
  const factors = {
    second: 1000,
    minute: 1000 * 60,
    hour: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
    week: 1000 * 60 * 60 * 24 * 7,
    month: 1000 * 60 * 60 * 24 * 30,
    year: 1000 * 60 * 60 * 24 * 30 * 12,
  };

  return (
    second * factors.second +
    minute * factors.minute +
    hour * factors.hour +
    day * factors.day +
    week * factors.week +
    month * factors.month +
    year * factors.year
  );
};
