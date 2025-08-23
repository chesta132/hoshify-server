interface JSON {
  /**
   * Checks if a given value is a valid JSON string.
   *
   * @param item - The value to test
   * @returns True if the value is a valid JSON string, false otherwise
   *
   * @example
   * JSON.isJSON('{"a":1}') // true
   * JSON.isJSON('invalid') // false
   */
  isJSON: (item: any) => boolean;
}

interface ObjectConstructor {
  /**
   * Compares multiple objects to see if all share the same key-value pairs
   * for the keys present in the "largest" object (the one with most keys).
   *
   * @template T - Object type
   * @param objectsProp - A list of objects to compare
   * @returns True if all objects have matching values for all keys of the largest object, false otherwise
   *
   * @example
   * Object.compare({a:1,b:2},{a:1,b:2}) // true
   * Object.compare({a:1,b:2},{a:1,b:3}) // false
   */
  compare<T extends object>(...objects: T[]): boolean;
}

interface String {
  /**
   * Capitalizes the first letter of a word in a string.
   *
   * @param [scissors] - The word or index to capitalize. If not provided, the first word of the string will be capitalized.
   * @returns The string with the specified word capitalized.
   */
  capital: (scissors?: string | number) => string;

  /**
   * Capitalizes the all word in a string.
   *
   * @param [start] - The start to split words.
   * @param [end] - The end to split words.
   * @returns The string with the specified word capitalized.
   */
  capitalEach: (start?: string | number, end?: string | number) => string;

  /**
   * Truncates the string and appends an ellipsis (`...`) if it exceeds the specified maximum length.
   *
   * @param max - The maximum allowed length of the string before truncation.
   * @returns The truncated string with an ellipsis if it exceeded the maximum length, otherwise the original string.
   */
  ellipsis: (max: number) => string;
}

interface Date {
  /**
   * Returns a string representation of a date. The format of the string is en-US locale.
   */
  toFormattedString(options?: { includeThisYear?: boolean; includeHour?: boolean }): string;
}

interface Array {
  /**
   * Returns a string representation plural or singular of base word based on array length.
   */
  plural(baseWord: string, uncountableNouns?: boolean): string;
}
