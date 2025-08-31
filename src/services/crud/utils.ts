import { ErrorTemplate } from "@/class/ErrorTemplate";
import { Model, ObjectId, PopulateOptions, ProjectionType, QueryOptions, SortOrder } from "mongoose";

export type Settings<T> = {
  project?: ProjectionType<T>;
  options?: QueryOptions<T>;
  populate?: PopulateOptions | (PopulateOptions | string)[];
  sort?: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | undefined | null;
  sortOptions?: { override?: boolean };
};

export const notFound = (model: Model<any>) => {
  return new ErrorTemplate({ code: "NOT_FOUND", item: model.getName() });
};

export const invalidObjectId = (model: Model<any>, id: string | ObjectId) => {
  console.warn(`Invalid ObjectId provided for model ${model.modelName}: ${id}`);
  return new ErrorTemplate({ code: "CLIENT_TYPE", field: "Object ID" });
};
