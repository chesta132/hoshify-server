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
   * @param objects - A list of objects to compare
   * @returns True if all objects have matching values for all keys of the largest object, false otherwise
   *
   * @example
   * Object.compare({a:1,b:2},{a:1,b:2}) // true
   * Object.compare({a:1,b:2},{a:1,b:3}) // false
   */
  compare<T extends object>(...objects: T[]): boolean;

  /**
   * Check prop is it object or not.
   *
   * @param object - Original object.
   *
   * @returns Boolean of prop is object or not
   */
  isObject<T extends object>(object: T): boolean;
}

/** Type representing all falsy values. */
type Falsy = "" | 0 | false | null | undefined | never;

/** Type representing all truthy values. */
type Truthy = Exclude<string | number | boolean | object | symbol | bigint | Function, Falsy>;

/** Returns `TrueType` if `T` is not falsy, otherwise `FalseType`. */
type IsTruthy<T, TrueType = T, FalseType = never> = [T] extends [Falsy] ? FalseType : TrueType;

/** Returns `TrueType` if `T` is falsy, otherwise `FalseType`. */
type IsFalsy<T, TrueType = T, FalseType = never> = [T] extends [Falsy] ? TrueType : FalseType;

/** Returns `TrueType` if `T` is array, otherwise `FalseType`. */
type IsArray<T, TrueType = T, FalseType = never> = [T] extends [any[]] ? TrueType : FalseType;

/** IsArray but not strict. */
type IncludeArray<T, TrueType = T, FalseType = never> = T extends any[] ? TrueType : FalseType;

/** Extracts the element type of an array `T`. */
type ExtractArray<T> = T extends (infer U)[] ? U : T;

/** Conditionally adds a new field to a type `T`. */
type ConditionalField<T, Key extends string, ExtraKey extends string, ExtraType> = IsFalsy<T[Key], T, T & { [K in ExtraKey]: ExtraType }>;
