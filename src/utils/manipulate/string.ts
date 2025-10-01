/**
 * Truncates the string and appends an ellipsis (`...`) if it exceeds the specified maximum length.
 *
 * @param string - Original string.
 * @param max - Maximum number of characters allowed.
 *
 * @returns The truncated string with an ellipsis if it exceeded the maximum length.
 */
export function ellipsis(string: string, max: number) {
  let limit = max as number;

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
