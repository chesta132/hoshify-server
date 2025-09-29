import {
  isValidObjectId,
  Model,
  MongooseUpdateQueryOptions,
  RootFilterQuery,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  UpdateWriteOpResult,
} from "mongoose";
import { Id, invalidObjectId, notFound, QueryResult, Settings } from ".";
import { Normalized } from "@/types";
import { getMany } from "./read";
import { ServerError } from "@/class/ServerError";

export const updateById = async <T, S extends Settings<T>>(
  model: Model<T>,
  id: Id,
  update: UpdateQuery<T>,
  settings?: S
): Promise<QueryResult<T, S, T>> => {
  const { error, options, populate, sort, sortOptions, project } = settings || {};
  if (!isValidObjectId(id)) {
    throw invalidObjectId();
  }

  const query = await model
    .findByIdAndUpdate(id, update, { projection: project, ...options })
    .populate(populate || [])
    .sort(sort, sortOptions)
    .normalize();

  if (!query && error !== null) {
    if (error) throw new ServerError(error);
    else throw notFound(model);
  }
  return query as Normalized<T>;
};

export const updateOne = async <T, S extends Settings<T>>(
  model: Model<T>,
  filter: RootFilterQuery<T>,
  update: UpdateQuery<T>,
  settings?: S
): Promise<QueryResult<T, S, T>> => {
  const { error, options, populate, sort, sortOptions, project } = settings || {};
  const query = await model
    .findOneAndUpdate(filter, update, { projection: project, ...options })
    .populate(populate || [])
    .sort(sort, sortOptions)
    .normalize();

  if (!query && error !== null) {
    if (error) throw new ServerError(error);
    else throw notFound(model);
  }
  return query as Normalized<T>;
};

export const updateMany = async <T, S extends { normalize?: boolean; options: MongooseUpdateQueryOptions } & Omit<Settings<T>, "error">>(
  model: Model<T>,
  filter: RootFilterQuery<T>,
  update: UpdateQuery<T> | UpdateWithAggregationPipeline,
  settings: S
): Promise<IsTruthy<S["normalize"], Normalized<T, []>, UpdateWriteOpResult>> => {
  const { options } = settings || {};
  const query = await model.updateMany(filter, update, options as MongooseUpdateQueryOptions);
  if (!settings.normalize) return query as any;
  return (await getMany(model, filter, settings)) as any;
};

export const restoreById = async <T, S extends Settings<T>>(
  model: Model<T>,
  id: Id,
  settings?: S,
  update?: Omit<UpdateQuery<T>, "isRecycled" | "deleteAt">
): Promise<QueryResult<T, S, T>> => {
  const { error, options, populate, sort, sortOptions, project } = settings || {};
  const query = await model
    .restoreById(id, update, { projection: project, ...options })
    .populate(populate || [])
    .sort(sort, sortOptions)
    .normalize();

  if (!query && error !== null) {
    if (error) throw new ServerError(error);
    else throw notFound(model);
  }
  return query as Normalized<T>;
};

export const restoreOne = async <T, S extends Settings<T>>(
  model: Model<T>,
  filter: RootFilterQuery<T> | Partial<T>,
  settings?: S,
  update?: Omit<UpdateQuery<T>, "isRecycled" | "deleteAt">
): Promise<QueryResult<T, S, T>> => {
  const { error, options, populate, sort, sortOptions, project } = settings || {};
  const query = await model
    .restoreOne(filter, update, { projection: project, ...options })
    .populate(populate || [])
    .sort(sort, sortOptions)
    .normalize();

  if (!query && error !== null) {
    if (error) throw new ServerError(error);
    else throw notFound(model);
  }
  return query as Normalized<T>;
};
