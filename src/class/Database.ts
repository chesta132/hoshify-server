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
} from "mongoose";
import { NormalizedData } from "../types/types";
import { normalizeQuery } from "../utils/normalizeQuery";

type Settings<T> = {
  project?: ProjectionType<T>;
  options?: QueryOptions<T>;
  populate?: PopulateOptions | (PopulateOptions | string)[];
  sort?: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | undefined | null;
  sortOptions?: { override?: boolean };
};

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

  async findByIdAndNormalize(id: string | ObjectId, settings?: Settings<T>) {
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
    return normalizeQuery(rawQuery) as NormalizedData<T>;
  }

  async findOneAndNormalize(filter: RootFilterQuery<T>, settings?: Settings<T>) {
    const rawQuery = await this.model
      .findOne(filter, settings?.project, settings?.options)
      .sort(settings?.sort, settings?.sortOptions)
      .populate(settings?.populate || [])
      .lean<T>();

    if (!rawQuery) return null;
    return normalizeQuery(rawQuery) as NormalizedData<T>;
  }

  async findAndNormalize(filter: RootFilterQuery<T>, settings?: Settings<T> & { returnArray?: boolean }) {
    const rawQuery = await this.model
      .find(filter, settings?.project, settings?.options)
      .sort(settings?.sort, settings?.sortOptions)
      .populate(settings?.populate || [])
      .lean<T>();

    if (rawQuery.length === 0 && !settings?.returnArray) return null;
    return normalizeQuery(rawQuery) as NormalizedData<T>[];
  }

  async updateByIdAndNormalize(id: string | ObjectId, update: UpdateQuery<T>, settings?: Settings<T>) {
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
    return normalizeQuery(rawQuery) as NormalizedData<T>;
  }

  async updateOneAndNormalize(filter: RootFilterQuery<T>, update: UpdateQuery<T>, settings?: Settings<T>) {
    const rawQuery = await this.model
      .findOneAndUpdate(filter, update, { ...settings?.options, projection: settings?.project })
      .sort(settings?.sort, settings?.sortOptions)
      .populate(settings?.populate || [])
      .lean<T>();

    if (!rawQuery) return null;
    return normalizeQuery(rawQuery) as NormalizedData<T>;
  }

  async updateManyAndNormalize(
    filter: RootFilterQuery<T>,
    update: UpdateQuery<T> | UpdateWithAggregationPipeline,
    settings: { sanitize?: boolean; options: MongooseUpdateQueryOptions } & Omit<Settings<T>, "project" | "options"> & { returnArray?: boolean }
  ) {
    const rawQuery = await this.model.updateMany(filter, update, settings?.options).sort(settings?.sort, settings?.sortOptions);

    if (settings?.options && settings.sanitize === undefined) settings = { ...settings, sanitize: true };

    if (rawQuery.modifiedCount === 0 && !settings?.returnArray) return null;
    if (!settings.sanitize) return rawQuery;
    return (await this.findAndNormalize(filter, settings)) as NormalizedData<T>[];
  }

  async createAndNormalize(doc: T | Partial<T>) {
    const rawQuery = await this.model.create(doc);
    return normalizeQuery(rawQuery) as NormalizedData<T>;
  }

  async insertManyAndNormalize(docs: T[] | Partial<T>[], settings?: { options?: InsertManyOptions }): Promise<NormalizedData<T>[]> {
    const rawQuery = await this.model.insertMany(docs, settings?.options ?? {});
    return normalizeQuery(rawQuery) as NormalizedData<T>[];
  }
}

export interface Database<T extends Record<string, any>> extends Model<T> {}
