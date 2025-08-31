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
