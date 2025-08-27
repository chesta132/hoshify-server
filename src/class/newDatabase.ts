import { USER_CRED } from "@/models/User";
import { NormalizedData } from "@/types/types";
import { normalizeQuery, normalizeUserQuery } from "@/utils/normalizeQuery";
import { UpdateOptions } from "mongodb";
import {
  Model,
  MongooseUpdateQueryOptions,
  ObjectId,
  ProjectionType,
  QueryOptions,
  RootFilterQuery,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from "mongoose";

type NonNullableNormalized<T> = T extends null ? null : NormalizedData<T>;
type Id = string | ObjectId;

export class Database<T extends Record<string, any>, R extends T | T[] | null> extends Model<T> {
  private model: Model<T>;
  data?: R;
  constructor(model: Model<T>) {
    super();
    this.model = model;
  }

  normalize: IsTruthy<R, () => NonNullableNormalized<R>> = (() => {
    if (!this.data) return this;
    let normalized;
    const isUser = (data: typeof this.data) => Object.keys(data).some((data) => USER_CRED.includes(data as (typeof USER_CRED)[number]));
    if (Array.isArray(this.data)) {
      this.data.forEach((raw, idx) => {
        normalized = [];
        if (isUser(raw)) {
          normalized[idx] = normalizeUserQuery(raw);
        } else {
          normalized[idx] = normalizeQuery(raw);
        }
      });
    } else {
      if (isUser(this.data)) {
        normalized = normalizeUserQuery(this.data as T);
      } else {
        normalized = normalizeQuery(this.data);
      }
    }
    this.data = undefined;
    return normalized;
  }) as any;

  async findById(id: Id, projection?: ProjectionType<T>, options?: QueryOptions<T>) {
    const data = await this.model.findById(id, projection, options);
    this.data = data as R;
    return this as Database<T, typeof data>;
  }

  async findOne(filter: RootFilterQuery<T>, projection?: ProjectionType<T>, options?: QueryOptions<T>) {
    const data = await this.model.findOne(filter, projection, options);
    this.data = data as R;
    return this as Database<T, typeof data>;
  }

  async find(filter: RootFilterQuery<T>, projection?: ProjectionType<T>, options?: QueryOptions<T>) {
    const data = await this.model.find(filter, projection, options);
    this.data = data as unknown as R;
    return this as Database<T, T[]>;
  }

  async findOneAndUpdate(filter: RootFilterQuery<T>, update: UpdateQuery<T>, options?: QueryOptions<T>) {
    const data = await this.model.findOneAndUpdate(filter, update, options);
    this.data = data as R;
    return this as Database<T, typeof data>;
  }

  async findOneAndDelete(filter: RootFilterQuery<T>, options?: QueryOptions<T>) {
    const data = await this.model.findOneAndDelete(filter, options);
    this.data = data as R;
    return this as Database<T, typeof data>;
  }

  async findByIdAndUpdate(id: Id, update: UpdateQuery<T>, options?: QueryOptions<T>) {
    const data = await this.model.findByIdAndUpdate(id, update, options);
    this.data = data as R;
    return this as Database<T, typeof data>;
  }

  async updateMany(
    filter: RootFilterQuery<T>,
    update: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options?: UpdateOptions & MongooseUpdateQueryOptions<T>
  ) {
    const data = await this.model.updateMany(filter, update, options);
    return data;
  }

  async createMany(...docs: Partial<T>[]) {
    const data = await this.model.create(...docs);
    this.data = data as unknown as R;
    return this as unknown as Database<T, typeof data>;
  }

  async create(doc: Partial<T>) {
    const data = await this.model.create(doc);
    this.data = data as R;
    return this as Database<T, typeof data>;
  }
}
