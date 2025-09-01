import { Normalized } from "@/types/types";
import { isValidObjectId, Model, RootFilterQuery } from "mongoose";
import { Id, invalidObjectId, notFound, QueryResult, Settings } from ".";
import { ErrorTemplate } from "@/class/ErrorTemplate";

export const getById = async <T, S extends Settings<T>>(model: Model<T>, id: Id, settings?: S): Promise<QueryResult<T, S, T>> => {
  const { error, options, populate, project, sort, sortOptions } = settings || {};

  if (!isValidObjectId(id)) {
    throw invalidObjectId();
  }

  const query = await model
    .findById(id, project, options)
    .populate(populate || [])
    .sort(sort, sortOptions)
    .normalize();

  if (!query && error !== null) {
    if (error) throw new ErrorTemplate(error);
    else throw notFound(model);
  }
  return query as Normalized<T>;
};

export const getOne = async <T, S extends Settings<T>>(
  model: Model<T>,
  filter: RootFilterQuery<T> & Partial<T>,
  settings?: S
): Promise<QueryResult<T, S, T>> => {
  const { error, options, populate, project, sort, sortOptions } = settings || {};
  const query = await model
    .findOne(filter, project, options)
    .populate(populate || [])
    .sort(sort, sortOptions)
    .normalize();

  if (!query && error !== null) {
    if (error) throw new ErrorTemplate(error);
    else throw notFound(model);
  }
  return query as Normalized<T>;
};

export const getMany = async <T>(
  model: Model<T>,
  filter: RootFilterQuery<T>,
  settings?: Omit<Settings<T>, "error">
): Promise<QueryResult<T, {}, []>> => {
  const { options, populate, project, sort, sortOptions } = settings || {};

  const query = await model
    .find(filter, project, options)
    .populate(populate || [])
    .sort(sort, sortOptions)
    .normalize();

  return query as Normalized<T, []>;
};
