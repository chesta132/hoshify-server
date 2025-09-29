/**
 * Only pick some fields in object, other properties will deleted.
 *
 * @param data - Object to initiate.
 * @param picks - Keys of data to pick.
 * @returns The object with only picked properties.
 */
export const pick = <T extends Record<string, any>, Z extends (keyof T)[] = []>(data: T, picks?: Z): Pick<T, Z[number]> => {
  const pickedData = { ...data };
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
export const omit = <T extends Record<string, any>, Z extends (keyof T)[] = []>(data: T, omits?: Z): Omit<T, Z[number]> => {
  const omittedData = { ...data };
  if (omits)
    for (const omit of omits) {
      delete omittedData[omit];
    }
  return omittedData;
};

/**
 * Creates a new object with the same keys as the given object,
 * but all values replaced with a fixed type/value.
 *
 * @param data - Original object to get the keys from
 * @param recordType - The value or type to assign to each key
 * @returns A new object where each key of `data` has the same value `recordType`
 *
 * @example
 * ```ts
 * const obj = { foo: 1, bar: "yo" };
 * const rec = record(obj, false);
 * // rec: { foo: boolean; bar: boolean } = { foo: false, bar: false }
 * ```
 */
export const record = <T extends Record<string, any>, Z>(data: T, recordType: Z) => {
  const buildedData = { ...data } as Record<keyof T, Z>;
  Object.keys(buildedData).forEach((key: keyof T) => {
    buildedData[key] = recordType;
  });
  return buildedData;
};
