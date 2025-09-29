import { getMaxChar, type CharOptions } from "./number";

type WidthOptions = { px: number } & Omit<CharOptions, "text">;

/**
 * Truncates the string and appends an ellipsis (`...`) if it exceeds the specified maximum length.
 *
 * @param string - Original string.
 * Two ways to define the limit:
 * - `max`: Maximum number of characters allowed.
 * - `width`: Maximum pixel width, measured with the given font settings.
 *   This uses `canvas.measureText` internally for accurate results.
 *
 * If both `max` and `width` are provided, `width` takes precedence.
 * @returns The truncated string with an ellipsis if it exceeded the maximum length, otherwise the original string.
 */
export function ellipsis(string: string, max: number): string;
export function ellipsis(string: string, width: WidthOptions): string;
export function ellipsis(string: string, max: number | WidthOptions) {
  let limit = max as number;
  const width = typeof max !== "number" && max;
  if (width) {
    const { fontSize, px, fontFamily } = width;
    limit = getMaxChar(px, { text: string, fontSize, fontFamily });
  }

  if (limit <= 0) return "";
  if (string.length <= limit) return string;
  if (limit <= 3) return string.slice(0, limit) + "...";
  return string.slice(0, limit - 3) + "...";
}

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

/**
 * Give spaces to original string.
 *
 * @param string - Original string.
 * @returns The string with spaces.
 *
 * @example
 * spacing("newUser") // new user
 */
export const spacing = (str: string) => {
  let spaced = "";
  for (const letter of str) {
    const idx = spaced.length - 1;
    if (str[idx - 1] !== " " && /[A-Z]/.test(letter)) {
      spaced += " " + letter;
    } else if (letter === "_" || letter === "-") {
      spaced += " ";
    } else {
      spaced += letter;
    }
  }
  return spaced.trim();
};

/**
 * Give hypens to original string.
 *
 * @param string - Original string.
 * @returns The string with hypens.
 *
 * @example
 * kebab("newUser") // new-user
 */
export const kebab = (str: string) => {
  return spacing(str).replaceAll(" ", "-");
};

/**
 * Inserts line breaks into a string so that each line fits within the specified pixel width.
 *
 * @param text - The original string to wrap.
 * @param width - Options for measuring text width.
 * @returns The string with line breaks (`\n`) inserted at appropriate points.
 *
 * @example
 * newLiner("konnichiwa minasan", { px: 50, fontSize: 14, fontFamily: "Arial" })
 * // "konnichi\nwa minasan"
 */
export const newLiner = (text: string, width: WidthOptions & { maxSlice?: number }): string => {
  const { fontSize, px, fontFamily, maxSlice } = width;
  const limit = getMaxChar(px, { text, fontSize, fontFamily });

  if (text.length <= limit) return text;

  const hasLatin = /[a-zA-Z]/.test(text);

  let cut = limit;

  if (hasLatin) {
    const vocal = ["a", "i", "u", "e", "o"];
    const lastVocal = vocal.map((v) => text.slice(0, limit).lastIndexOf(v)).sort((a, b) => b - a)[0];

    if (lastVocal > 0) {
      cut = lastVocal + 1;
    }
  }

  if (maxSlice && text.length - cut > maxSlice) {
    cut = limit;
  }

  return text.slice(0, cut) + "\n" + newLiner(text.slice(cut), width);
};

/**
 * Checks whether a given string is a valid HTTP or HTTPS URL.
 *
 * @param str - The string to validate as a URL.
 * @returns True if the string is a valid HTTP/HTTPS URL, false otherwise.
 *
 * @example
 * isValidUrl("https://google.com") // true
 * isValidUrl("notaurl") // false
 */
export const isValidUrl = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Converts a currency string to a number.
 *
 * @param str - The currency string to convert.
 * @returns The numeric value of the currency string.
 *
 * @example
 * currencyToNumber("Rp 1.000,00") // 1000000
 * currencyToNumber("$1,000.00") // 1000
 */
export const currencyToNumber = (str: string) => {
  return Number(str.replace(/[^\d,-]/g, "").replace(",", "."));
};
