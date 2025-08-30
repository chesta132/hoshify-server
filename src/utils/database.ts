import { NODE_ENV } from "@/app";
import { OneFieldOnly } from "@/types/types";
import { normalizeQuery, normalizeUserQuery } from "@/utils/normalizeQuery";
import { randomDate, randomNumber } from "@/utils/random";
import { oneWeeks } from "@/utils/token";
import { Document, Model, ObjectId, Query, QueryOptions, RootFilterQuery, UpdateQuery, Schema, CreateOptions, isValidObjectId } from "mongoose";
import { Response, Request } from "express";

export const getDeleteTTL = () => new Date(Date.now() + oneWeeks);

Document.prototype.normalize = function () {
  return normalizeQuery(this);
};

Document.prototype.normalizeUser = function () {
  return normalizeUserQuery(this);
};

Query.prototype.normalize = async function () {
  const query = await this.exec();
  if (!query) return null;
  return normalizeQuery(query);
};

Query.prototype.normalizeUser = async function () {
  const query = await this.exec();
  if (!query) return null;
  return normalizeUserQuery(query);
};

Model.getName = function () {
  return this.collection.name.slice(0, -1).toLowerCase();
};

export function restoreById<T>(
  this: Model<T>,
  id: string | ObjectId,
  update?: Omit<UpdateQuery<T>, "isRecycled" | "deleteAt">,
  options?: QueryOptions<T>
) {
  return this.findByIdAndUpdate(id, { ...update, isRecycled: false, deleteAt: null }, options);
}

export function restoreOne<T>(
  this: Model<T>,
  filter: RootFilterQuery<T>,
  update?: Omit<UpdateQuery<T>, "isRecycled" | "deleteAt">,
  options?: QueryOptions<T>
) {
  return this.findOneAndUpdate(filter, { ...update, isRecycled: false, deleteAt: null }, options);
}

export function softDeleteById<T>(
  this: Model<T>,
  id: string | ObjectId,
  update?: Omit<UpdateQuery<T>, "isRecycled" | "deleteAt">,
  options?: QueryOptions<T>
) {
  return this.findByIdAndUpdate(id, { ...update, isRecycled: true, deleteAt: getDeleteTTL() }, options);
}

export function softDeleteOne<T>(
  this: Model<T>,
  filter: RootFilterQuery<T>,
  update?: Omit<UpdateQuery<T>, "isRecycled" | "deleteAt">,
  options?: QueryOptions<T>
) {
  return this.findOneAndUpdate(filter, { ...update, isRecycled: true, deleteAt: getDeleteTTL() }, options);
}

export async function generateDummy<T>(
  this: Model<T>,
  length: number,
  document: Partial<
    Record<
      string,
      OneFieldOnly<{
        dynamicString: string;
        fixed: any;
        dynamicDate: { start?: Date; end?: Date };
        dynamicNumber: { min?: number; max?: number };
        enum: any[];
      }>
    >
  >,
  settings?: { options?: CreateOptions; raw?: boolean }
) {
  if (NODE_ENV !== "development") return;

  const dummys = Array.from(new Array(length)).map(() => {
    const customized: [string, any][] = [];
    for (const [doc, val] of Object.entries(document)) {
      if (val?.fixed) {
        customized.push([doc, val.fixed]);
      } else if (val?.dynamicString) {
        const dynamiced = `${val.dynamicString}_${crypto.randomUUID()}`;
        customized.push([doc, dynamiced]);
      } else if (val?.dynamicNumber) {
        const { max, min } = val.dynamicNumber;
        const rand = randomNumber(min, max);
        customized.push([doc, rand]);
      } else if (val?.dynamicDate) {
        const { start, end } = val.dynamicDate;
        const rand = randomDate(start, end);
        customized.push([doc, rand]);
      } else if (val?.enum) {
        const rand = randomNumber(0, val.enum.length - 1);
        const choosen = val.enum[rand];
        customized.push([doc, choosen]);
      }
    }
    const data = { dummy: true } as Record<string, any>;
    customized.forEach(([key, val]) => {
      data[key] = val;
    });
    return data;
  });

  const rawQuery = await this.create(dummys, settings?.options);
  if (settings?.raw) return rawQuery;
  return normalizeQuery(rawQuery);
}

export const softDeletePlugin = (schema: Schema) => {
  const fns = [softDeleteById, softDeleteOne, restoreById, restoreOne] as const;
  fns.forEach((fn) => {
    schema.statics[fn.name] = fn;
  });
};

export const dummyPlugin = (schema: Schema) => {
  const fns = [generateDummy] as const;
  fns.forEach((fn) => {
    schema.statics[fn.name] = fn;
  });
};

export const validateIds = (ids: string[], res: Response["res"]) => {
  if (!Array.isArray(ids)) {
    res.tempClientType("invalid body type. Array only").respond();
    return false;
  }
  let invalidIds: string[] = [];

  const isObjectId = ids?.every((id) => {
    if (isValidObjectId(id)) return true;
    else {
      invalidIds.push(id);
      return false;
    }
  });

  if (!isObjectId) {
    res.tempClientType("Object ID", `${invalidIds.join(", ")} is not ObjectId.`).respond();
    return false;
  }
  return true;
};

export const validateRequires = (neededField: string[], from: any, res: Response["res"]) => {
  const missingFields: string[] = [];
  let isValid = true;
  if (Array.isArray(from)) {
    from.forEach((data) => {
      neededField.forEach((field) => {
        if (data[field] === undefined) {
          missingFields.push(field);
          isValid = false;
        }
      });
    });
  } else {
    neededField.forEach((field) => {
      if (from[field] === undefined) {
        missingFields.push(field);
        isValid = false;
      }
    });
  }

  if (!isValid) {
    res.tempMissingFields(missingFields.join(", ")).respond();
    return false;
  }
  return true;
};
