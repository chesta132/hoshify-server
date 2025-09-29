import dayjs, { Dayjs } from "dayjs";

type FormatDateOptions = { includeThisYear?: boolean; includeHour?: boolean };
/**
 * Returns a string representation of a date. The format of the string is en-US locale.
 *
 * @param date - Original date
 * @param options - Options for date format
 * @returns Formatted date in type of string
 */
export const formatDate = (date: Date, options: FormatDateOptions = { includeThisYear: true }) => {
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const hourOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  try {
    if (date.toString() === "Invalid Date") {
      return "Invalid Date";
    }
    const { includeHour, includeThisYear } = options;
    const formatter = new Intl.DateTimeFormat("en-US", includeHour ? { ...formatOptions, ...hourOptions } : formatOptions);
    const formattedDate = formatter.format(date);
    const thisYear = new Date().getFullYear().toString();

    if (formattedDate.includes(thisYear) && !includeThisYear) {
      const splittedDate = formattedDate.split(", " + thisYear);
      return splittedDate.join("");
    }

    return formattedDate;
  } catch (error) {
    console.error(error);
    return "Invalid Date";
  }
};

export const isIsoDateValid = (dateString: string | Date) => {
  const parsedDate = dayjs(dateString);
  return parsedDate.isValid() && dateString.toString().includes("T") && dateString.toString().includes("Z");
};

type NormalizedDates<T> = T extends (infer U)[]
  ? NormalizedDates<U>[]
  : {
      [K in keyof T]: T[K] extends Date
        ? Dayjs
        : T[K] extends Date | undefined
        ? Dayjs | undefined
        : T[K] extends object
        ? NormalizedDates<T[K]>
        : T[K];
    };

export const normalizeDates = <T extends Record<string, any> | any[]>(
  data: T
): T extends any[] ? NormalizedDates<ExtractArray<T>>[] : NormalizedDates<T> => {
  if (typeof data !== "object" || data === null) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((arr) => normalizeDates(arr)) as any;
  }
  const sanitized = { ...data } as Record<string, any>;

  for (const key in sanitized) {
    if (!Object.prototype.hasOwnProperty.call(sanitized, key)) {
      continue;
    }
    const value = sanitized[key];

    if (isIsoDateValid(value)) {
      sanitized[key] = dayjs(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => normalizeDates(item));
    } else if (typeof value === "object" && value !== null) {
      normalizeDates(value);
    }
  }
  return sanitized as any;
};
