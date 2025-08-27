import {
  InsertManyOptions,
  isValidObjectId,
  Model,
  MongooseUpdateQueryOptions,
  ObjectId,
  PopulateOptions,
  ProjectionType,
  QueryOptions,
  RootFilterQuery,
  SortOrder,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  UpdateWriteOpResult,
} from "mongoose";
import { NormalizedData, OneFieldOnly } from "../types/types";
import { normalizeQuery } from "../utils/normalizeQuery";
import { NODE_ENV } from "../app";
import { oneWeeks } from "../utils/token";
import crypto from "crypto";

type Settings<T> = {
  project?: ProjectionType<T>;
  options?: QueryOptions<T>;
  populate?: PopulateOptions | (PopulateOptions | string)[];
  sort?: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | undefined | null;
  sortOptions?: { override?: boolean };
  raw?: boolean;
};

type QueryReturn<T, S, Z = T> = Promise<([S] extends [{ raw: true }] ? Z : NormalizedData<T>) | null>;

type SoftDelete<T extends Record<string, any>, FilterType> = IsTruthy<
  T["isRecycled"],
  <S extends Settings<T>>(filter: FilterType, update?: Omit<UpdateQuery<T>, "isRecycled" | "deleteAt">, settings?: S) => QueryReturn<T, S>
>;

export class Database<T extends Record<string, any>> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        const value = (model as any)[prop as any];
        return typeof value === "function" ? value.bind(model) : value;
      },
    });
  }

  private async validateDoc(doc: object) {
    try {
      const model = new this.model(doc);
      await model.validate();
      return model;
    } catch (err) {
      console.error("Invalid doc model", doc);
      throw err;
    }
  }

  async findByIdAndNormalize<S extends Settings<T>>(id: string | ObjectId, settings?: S): QueryReturn<T, S> {
    if (!isValidObjectId(id)) {
      console.warn(`Invalid ObjectId provided for model ${this.model.modelName}: ${id}`);
      return null;
    }

    const rawQuery = await this.model
      .findById(id, settings?.project, settings?.options)
      .sort(settings?.sort, settings?.sortOptions)
      .populate(settings?.populate || [])
      .lean<T>();

    if (!rawQuery) return null;
    if (settings?.raw) return rawQuery as any;
    return normalizeQuery(rawQuery) as any;
  }

  async findOneAndNormalize<S extends Settings<T>>(filter: RootFilterQuery<T>, settings?: S): QueryReturn<T, S> {
    const rawQuery = await this.model
      .findOne(filter, settings?.project, settings?.options)
      .sort(settings?.sort, settings?.sortOptions)
      .populate(settings?.populate || [])
      .lean<T>();

    if (!rawQuery) return null;
    if (settings?.raw) return rawQuery as any;
    return normalizeQuery(rawQuery) as any;
  }

  async findAndNormalize<S extends Settings<T>>(filter: RootFilterQuery<T>, settings?: S & { returnArray?: boolean }): QueryReturn<T[], S> {
    const rawQuery = await this.model
      .find(filter, settings?.project, settings?.options)
      .sort(settings?.sort, settings?.sortOptions)
      .populate(settings?.populate || [])
      .lean<T[]>();

    if (rawQuery.length === 0 && !settings?.returnArray) return null;
    if (settings?.raw) return rawQuery as any;
    return normalizeQuery(rawQuery) as any;
  }

  async updateByIdAndNormalize<S extends Settings<T>>(id: string | ObjectId, update: UpdateQuery<T>, settings?: S): QueryReturn<T, S> {
    if (!isValidObjectId(id)) {
      console.warn(`Invalid ObjectId provided for model ${this.model.modelName}: ${id}`);
      return null;
    }

    const rawQuery = await this.model
      .findByIdAndUpdate(id, update, { ...settings?.options, projection: settings?.project })
      .sort(settings?.sort, settings?.sortOptions)
      .populate(settings?.populate || [])
      .lean<T>();

    if (!rawQuery) return null;
    if (settings?.raw) return rawQuery as any;
    return normalizeQuery(rawQuery) as any;
  }

  async updateOneAndNormalize<S extends Settings<T>>(filter: RootFilterQuery<T>, update: UpdateQuery<T>, settings?: S): QueryReturn<T, S> {
    const rawQuery = await this.model
      .findOneAndUpdate(filter, update, { ...settings?.options, projection: settings?.project })
      .sort(settings?.sort, settings?.sortOptions)
      .populate(settings?.populate || [])
      .lean<T>();

    if (!rawQuery) return null;
    if (settings?.raw) return rawQuery as any;
    return normalizeQuery(rawQuery) as any;
  }

  async updateManyAndNormalize<S extends Settings<T>>(
    filter: RootFilterQuery<T>,
    update: UpdateQuery<T> | UpdateWithAggregationPipeline,
    settings?: { options?: MongooseUpdateQueryOptions } & Omit<S, "project" | "options"> & { returnArray?: boolean }
  ): QueryReturn<T[], S, UpdateWriteOpResult> {
    const rawQuery = await this.model.updateMany(filter, update, settings?.options).sort(settings?.sort, settings?.sortOptions);

    if (rawQuery.modifiedCount === 0 && !settings?.returnArray) return null;
    if (settings?.raw) return rawQuery as any;
    return (await this.findAndNormalize(filter, settings)) as any;
  }

  async createAndNormalize(doc: T | Partial<T>) {
    const rawQuery = await this.model.create(doc);
    return normalizeQuery(rawQuery) as NormalizedData<T>;
  }

  async insertManyAndNormalize(docs: T[] | Partial<T>[], settings?: { options?: InsertManyOptions; skipValidation: boolean; raw: boolean }) {
    const document = docs;
    if (!settings?.skipValidation) {
      for (const [idx, doc] of document.entries()) {
        document[idx] = await this.validateDoc(doc);
      }
    }
    const rawQuery = await this.model.insertMany(docs, settings?.options ?? {});
    if (settings?.raw) return rawQuery;
    return normalizeQuery(rawQuery) as NormalizedData<T>[];
  }

  async generateDummy(
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
          customized.push([doc, val.fixed]);
        }
      }
      const ret = { dummy: true } as Record<string, any>;
      customized.forEach(([key, val]) => {
        ret[key] = val;
      });

      dummys[idx] = await this.validateDoc(ret);
    }

    const rawQuery = await this.model.insertMany(dummys, settings?.options ?? {});
    if (settings?.raw) return rawQuery;
    return normalizeQuery(rawQuery);
  }

  softDeleteById: SoftDelete<T, string | ObjectId> = (async <S extends Settings<T>>(
    id: string | ObjectId,
    update?: Omit<UpdateQuery<T>, "isRecycled" | "deleteAt">,
    settings?: S
  ) => {
    return await this.updateByIdAndNormalize(id, { ...update, isRecycled: true, deleteAt: new Date(Date.now() + oneWeeks) }, settings);
  }) as any;

  softDeleteOne: SoftDelete<T, RootFilterQuery<T>> = (async <S extends Settings<T>>(
    filter: RootFilterQuery<T>,
    update?: Omit<UpdateQuery<T>, "isRecycled" | "deleteAt">,
    settings?: S
  ) => {
    return await this.updateOneAndNormalize(filter, { ...update, isRecycled: true, deleteAt: new Date(Date.now() + oneWeeks) }, settings);
  }) as any;

  restoreById: SoftDelete<T, string | ObjectId> = (async <S extends Settings<T>>(
    id: string | ObjectId,
    update?: Omit<UpdateQuery<T>, "isRecycled" | "deleteAt">,
    settings?: S
  ) => {
    return await this.updateByIdAndNormalize(id, { ...update, isRecycled: false, deleteAt: null }, settings);
  }) as any;

  restoreOne: SoftDelete<T, RootFilterQuery<T>> = (async <S extends Settings<T>>(
    filter: RootFilterQuery<T>,
    update?: Omit<UpdateQuery<T>, "isRecycled" | "deleteAt">,
    settings?: S
  ) => {
    return await this.updateOneAndNormalize(filter, { ...update, isRecycled: false, deleteAt: null }, settings);
  }) as any;
}

export interface Database<T extends Record<string, any>> extends Model<T> {}
