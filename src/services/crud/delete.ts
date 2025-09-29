import { Model, RootFilterQuery, UpdateQuery } from "mongoose";
import { Id, notFound, QueryResult, Settings } from ".";
import { ServerError } from "@/class/ServerError";
import { Normalized } from "@/types";

export const softDeleteOne = async <T, S extends Omit<Settings<T>, "project">>(
  model: Model<T>,
  filter: RootFilterQuery<T> | Partial<T>,
  settings?: S,
  update?: Omit<UpdateQuery<T>, "isRecycled" | "deleteAt">
): Promise<QueryResult<T, S, T>> => {
  const { error, options, populate, sort, sortOptions } = settings || {};
  const query = await model
    .softDeleteOne(filter, update, options)
    .populate(populate || [])
    .sort(sort, sortOptions)
    .normalize();

  if (!query && error !== null) {
    if (error) throw new ServerError(error);
    else throw notFound(model);
  }
  return query as Normalized<T>;
};

export const softDeleteById = async <T, S extends Omit<Settings<T>, "project">>(
  model: Model<T>,
  id: Id,
  settings?: S,
  update?: Omit<UpdateQuery<T>, "isRecycled" | "deleteAt">
): Promise<QueryResult<T, S, T>> => {
  const { error, options, populate, sort, sortOptions } = settings || {};
  const query = await model
    .softDeleteById(id, update, options)
    .populate(populate || [])
    .sort(sort, sortOptions)
    .normalize();

  if (!query && error !== null) {
    if (error) throw new ServerError(error);
    else throw notFound(model);
  }
  return query as Normalized<T>;
};

export const deleteById = async <T, S extends Omit<Settings<T>, "project">>(model: Model<T>, id: Id, settings?: S): Promise<QueryResult<T, S, T>> => {
  const { error, options, populate, sort, sortOptions } = settings || {};
  const query = await model
    .findByIdAndDelete(id, options)
    .populate(populate || [])
    .sort(sort, sortOptions)
    .normalize();

  if (!query && error !== null) {
    if (error) throw new ServerError(error);
    else throw notFound(model);
  }
  return query as Normalized<T>;
};

export const deleteOne = async <T, S extends Omit<Settings<T>, "project">>(
  model: Model<T>,
  filter: RootFilterQuery<T> | Partial<T>,
  settings?: S
): Promise<QueryResult<T, S, T>> => {
  const { error, options, populate, sort, sortOptions } = settings || {};
  const query = await model
    .findOneAndDelete(filter, options)
    .populate(populate || [])
    .sort(sort, sortOptions)
    .normalize();

  if (!query && error !== null) {
    if (error) throw new ServerError(error);
    else throw notFound(model);
  }
  return query as Normalized<T>;
};
