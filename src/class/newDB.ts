import { NODE_ENV } from "@/app";
import { OneFieldOnly } from "@/types/types";
import { normalizeQuery, normalizeUserQuery } from "@/utils/normalizeQuery";
import { oneWeeks } from "@/utils/token";
import { Document, Model, ObjectId, Query, QueryOptions, RootFilterQuery, UpdateQuery, Schema, InsertManyOptions } from "mongoose";

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
  return this.findByIdAndUpdate(id, { ...update, isRecycled: true, deleteAt: new Date(Date.now() + oneWeeks) }, options);
}

export function softDeleteOne<T>(
  this: Model<T>,
  filter: RootFilterQuery<T>,
  update?: Omit<UpdateQuery<T>, "isRecycled" | "deleteAt">,
  options?: QueryOptions<T>
) {
  return this.findOneAndUpdate(filter, { ...update, isRecycled: true, deleteAt: new Date(Date.now() + oneWeeks) }, options);
}

export async function generateDummy<T>(
  this: any,
  length: number,
  document?: Partial<Record<keyof T, OneFieldOnly<{ dynamicString: string; fixed: T[keyof T] }>>>,
  settings?: { options?: InsertManyOptions; raw?: boolean }
) {
  if (NODE_ENV !== "development") return;

  const dummys = Array.from(new Array(length));

  for (const [idx] of dummys.entries()) {
    const customized: [string, string][] = [];
    for (const doc in document) {
      const val = document[doc];
      if (val?.dynamicString) {
        const dynamiced = `${val.dynamicString}_${crypto.randomUUID()}`;
        customized.push([doc, dynamiced]);
      } else if (val?.fixed) {
        customized.push([doc, val.fixed as string]);
      }
    }
    const ret = { dummy: true } as Record<string, any>;
    customized.forEach(([key, val]) => {
      ret[key] = val;
    });

    const modelInstance = new this.model(ret);
    try {
      await modelInstance.validate();
      dummys[idx] = modelInstance.toObject();
    } catch (err) {
      console.error("Invalid doc model", ret);
      throw err;
    }
  }

  const rawQuery = await this.model.insertMany(dummys, settings?.options ?? {});
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
