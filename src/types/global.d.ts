import { TUser } from "@/services/db/User";
import { Respond } from "../class/Response";
import { $Enums } from "@prisma/client";

declare global {
  namespace Express {
    interface User extends TUser {}
    interface Response {
      res: Respond;
    }
  }
  interface JwtPayload {
    userId: string;
    expires: Date;
    verified: boolean;
    role: $Enums.UserRole;
  }

  interface Console {
    /**
     * Console log when its not in production env
     */
    debug(message?: "NO_TRACE" | (string & {}), ...data: any[]): void;

    /**
     * Console table when its not in production env
     */
    debugTable(tabularData: any, properties?: readonly string[], trace?: "NO_TRACE" | "SUPER_TRACE"): void;
  }

  interface JSON {
    /**
     * Checks if a given value is a valid JSON string.
     *
     * @param text - The value to test
     * @returns True if the value is a valid JSON string, false otherwise
     *
     * @example
     * JSON.isJSON('{"a":1}') // true
     * JSON.isJSON('invalid') // false
     */
    isJSON: (text: string) => boolean;

    /**
     * Safely parses a JSON string into a JavaScript value.
     * Returns the parsed value if valid, or the given fallback value if parsing fails.
     *
     * @param text - The JSON string to parse.
     * @param fallback - The value to return if parsing fails (default: undefined).
     * @returns The parsed value if valid JSON, otherwise the fallback.
     *
     * @example
     * JSON.safeParse('{"a":1}') // { a: 1 }
     * JSON.safeParse<number>("123", 0) // 123
     * JSON.safeParse<number>("not-a-number", 0) // 0
     */
    safeParse: <T = any>(text?: string, fallback?: T) => T;
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

    /**
     * Object.typedEntries dengan typing yang lebih strict.
     *
     * @example
     * ```ts
     * const object = { foo: 1, bar: "yo" };
     * for (const [k, v] of Object.typedEntries(object)) {
     *   // k: "foo" | "bar"
     *   // v: number | string
     * }
     * ```
     */
    typedEntries<T extends object>(object: T): [keyof T, T[keyof T]][];

    /**
     * Returns typed keys of the given object with stricter typing.
     *
     * @param object - Original object
     * @returns Array of keys with strict typing
     *
     * @example
     * ```ts
     * const object = { foo: 1, bar: "yo" };
     * const keys = Object.typedKeys(object);
     * // keys: ("foo" | "bar")[]
     * ```
     */
    typedKeys<T extends object>(object: T): (keyof T)[];

    /**
     * Returns typed values of the given object with stricter typing.
     *
     * @param object - Original object
     * @returns Array of values with strict typing
     *
     * @example
     * ```ts
     * const object = { foo: 1, bar: "yo" };
     * const values = Object.typedValues(object);
     * // values: (number | string)[]
     * ```
     */
    typedValues<T extends object>(object: T): T[keyof T][];
  }

  /** Union type representing all base JS types. */
  type AllType = Function | string | number | boolean | object | symbol | bigint;

  /**
   * Utility type that removes all fields from `T` whose value type does not extend `Z`.
   */
  type OmitNon<T, Z> = {
    [K in keyof T as T[K] extends Z ? K : never]: T[K];
  };

  /** Type representing all falsy values. */
  type Falsy = "" | 0 | false | null | undefined | never;

  /** Type representing all truthy values. */
  type Truthy = Exclude<AllType, Falsy>;

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

  /** Replaces all occurrences of substring `W` in string `S` with `R`. */
  type Replace<S extends string, F extends string, R extends string> = S extends `${infer First}${F}${infer Last}` ? `${First}${R}${Last}` : S;
}
