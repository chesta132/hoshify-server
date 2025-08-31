import { NormalizedData } from "@/types/types";
import { isValidObjectId, Model, ObjectId, RootFilterQuery } from "mongoose";
import { invalidObjectId, notFound, Settings } from "./utils";

export const getById = async <T>(model: Model<T>, id: string | ObjectId, settings?: Settings<T>): Promise<NormalizedData<T>> => {
  if (!isValidObjectId(id)) {
    throw invalidObjectId(model, id);
  }

  const query = await model
    .findById(id, settings?.project, settings?.options)
    .populate(settings?.populate || [])
    .sort(settings?.sort, settings?.sortOptions)
    .normalize();

  if (!query) throw notFound(model);
  return query;
};

export const getOne = async <T>(model: Model<T>, filter: RootFilterQuery<T>, settings?: Settings<T>): Promise<NormalizedData<T>> => {
  const query = await model
    .findOne(filter, settings?.project, settings?.options)
    .populate(settings?.populate || [])
    .sort(settings?.sort, settings?.sortOptions)
    .normalize();

  if (!query) throw notFound(model);
  return query;
};

export const getMany = async <T>(model: Model<T>, filter: RootFilterQuery<T>, settings?: Settings<T>): Promise<NormalizedData<T>[]> => {
  const query = await model
    .find(filter, settings?.project, settings?.options)
    .populate(settings?.populate || [])
    .sort(settings?.sort, settings?.sortOptions)
    .normalize();

  return query as NormalizedData<T>[];
};
