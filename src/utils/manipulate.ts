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
export const virtualId = (schema: Schema) => {
  schema.virtual("id").get(function () {
    return (this._id as string).toString();
  });
};
