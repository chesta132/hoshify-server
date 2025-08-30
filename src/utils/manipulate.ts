import { Schema } from "mongoose";

/**
 * Only pick some fields in object, other properties will deleted.
 *
 * @param data - Object to initiate.
 * @param picks - Keys of data to pick.
 * @returns The object with only picked properties.
 */
export const pick = <T extends Record<string, any>, Z extends (keyof T)[]>(data: T, picks?: Z): Pick<T, Z[number]> => {
  const pickedData = data.toObject ? data.toObject() : { ...data };
  if (picks)
    for (const pick of Object.keys(pickedData)) {
      if (!picks.includes(pick as keyof object)) {
        delete pickedData[pick as keyof object];
      }
    }
  return pickedData;
};

/**
 * Only omit some fields in object, other properties will remain.
 *
 * @param data - Object to initiate.
 * @param omits - Keys of data to omit.
 * @returns The object with omitted properties.
 */
export const omit = <T extends Record<string, any>, Z extends (keyof T)[]>(data: T, omits?: Z): Omit<T, Z[number]> => {
  const omittedData = data.toObject ? data.toObject() : { ...data };
  if (omits)
    for (const omit of omits) {
      delete omittedData[omit];
    }
  return omittedData;
};

/**
 * Create id from _id reference.
 *
 * @param schema - Schema to initiate.
 */
export const virtualSchema = (schema: Schema) => {
  schema.virtual("id").get(function () {
    return (this._id as string).toString();
  });
  schema.set("toObject", { virtuals: true });
  schema.set("toJSON", { virtuals: true });
};

/**
 * Truncates the string and appends an ellipsis (`...`) if it exceeds the specified maximum length.
 *
 * @param string - Original string.
 * @param max - The maximum allowed length of the string before truncation.
 * @returns The truncated string with an ellipsis if it exceeded the maximum length, otherwise the original string.
 */
export const ellipsis = (string: string, max: number) => {
  if (max <= 0) return "";
  if (string.length <= max) return string;
  if (max <= 3) return string.slice(0, max);
  return string.slice(0, max - 3) + "...";
};

/**
 * Capitalizes the first letter of a word in a string.
 *
 * @param string - Original string.
 * @returns The string with the specified word capitalized.
 */
export const capital = (string: string) => {
  const sliceString = string.slice(0);
  const restOfWord = string.slice(1);

  const firstLetter = sliceString.charAt(0).toUpperCase();

  let resultString = firstLetter + restOfWord;

  const nextDot = resultString.indexOf(".");
  if (nextDot !== -1) {
    const sliced = resultString.slice(nextDot + 1);
    const trimmed = sliced.trimStart();
    const spacesDeleted = sliced.length - trimmed.length;
    const deletedSpaces = spacesDeleted === 0 ? "" : " ".repeat(spacesDeleted);
    resultString = resultString.slice(0, nextDot + 1) + deletedSpaces + capital(trimmed);
  }

  return resultString;
};

/**
 * Capitalizes the all word in a string.
 *
 * @param string - Original string.
 * @param start - The start to split words.
 * @param end - The end to split words.
 * @returns The string with the specified word capitalized.
 */
export const capitalEach = (str: string, start?: string | number, end?: string | number) => {
  let startIndex = 0;
  let endIndex = str.length;

  if (typeof start === "string") {
    const idx = str.indexOf(start);
    if (idx !== -1) startIndex = idx;
  } else if (typeof start === "number") {
    startIndex = start;
  }

  if (typeof end === "string") {
    const idx = str.indexOf(end);
    if (idx !== -1) endIndex = idx;
  } else if (typeof end === "number") {
    endIndex = end;
  }

  const prefix = str.slice(0, startIndex);
  const suffix = str.slice(endIndex);

  const capitalized = str
    .slice(startIndex, endIndex)
    .split(" ")
    .map((word) => (word[0] ? word[0].toUpperCase() + word.slice(1) : ""))
    .join(" ");

  return prefix + capitalized + suffix;
};

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

/**
 * Give spaces to original string.
 *
 * @param string - Original string.
 * @returns The string with spaces.
 *
 * @example
 * spacing("newUser") // new user
 */
export const spacing = (string: string) => {
  let spaced = "";
  for (const letter of string) {
    if (new RegExp("[A-Z]").test(letter)) {
      spaced = `${spaced} ${letter.toLowerCase()}`;
      continue;
    } else if (letter === "_") {
      spaced = `${spaced} `;
      continue;
    } else spaced = spaced + letter;
  }
  return spaced;
};
