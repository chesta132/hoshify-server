import {
  isValidObjectId,
  Model,
  MongooseUpdateQueryOptions,
  ObjectId,
  RootFilterQuery,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  UpdateWriteOpResult,
} from "mongoose";
import { invalidObjectId, notFound, Settings } from "./utils";
import { Normalized, NormalizedData } from "@/types/types";
import { getMany } from "./read";

export const updateById = async <T>(
  model: Model<T>,
  id: string | ObjectId,
  update: UpdateQuery<T>,
  settings?: Omit<Settings<T>, "project">
): Promise<NormalizedData<T>> => {
  if (!isValidObjectId(id)) {
    throw invalidObjectId(model, id);
  }

  const query = await model
    .findByIdAndUpdate(id, update, settings?.options)
    .populate(settings?.populate || [])
    .sort(settings?.sort, settings?.sortOptions)
    .normalize();

  if (!query) throw notFound(model);
  return query;
};

export const updateOne = async <T>(
  model: Model<T>,
  filter: RootFilterQuery<T>,
  update: UpdateQuery<T>,
  settings?: Omit<Settings<T>, "project">
): Promise<NormalizedData<T>> => {
  const query = await model
    .findOneAndUpdate(filter, update, settings?.options)
    .populate(settings?.populate || [])
    .sort(settings?.sort, settings?.sortOptions)
    .normalize();

  if (!query) throw notFound(model);
  return query;
};

export const updateMany = async <
  T,
  S extends { normalize?: boolean; options: MongooseUpdateQueryOptions } & Omit<Settings<T>, "project" | "options">
>(
  model: Model<T>,
  filter: RootFilterQuery<T>,
  update: UpdateQuery<T> | UpdateWithAggregationPipeline,
  settings: S
): Promise<IsTruthy<S["normalize"], Normalized<T>, UpdateWriteOpResult>> => {
  const query = await model.updateMany(filter, update, settings?.options);
  if (!settings.normalize) return query as any;
  return (await getMany(model, filter, settings)) as any;
};
