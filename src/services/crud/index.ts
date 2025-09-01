import { ErrorTemplate, ErrorTemplateConfig } from "@/class/ErrorTemplate";
import { Model, ObjectId, PopulateOptions, ProjectionType, QueryOptions, SortOrder } from "mongoose";
import * as read from "./read";
import * as update from "./update";
import * as create from "./create";
import * as deletes from "./delete";
import { Normalized } from "@/types/types";

export type Id = string | ObjectId;

export type Settings<T> = {
  project?: ProjectionType<T>;
  options?: QueryOptions<T>;
  populate?: PopulateOptions | (PopulateOptions | string)[];
  sort?: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | undefined | null;
  sortOptions?: { override?: boolean };
  error?: ErrorTemplateConfig | null;
};

export type QueryResult<T, S extends Partial<Settings<T>> = {}, Z = T> = S["error"] extends null ? Normalized<T, Z> | null : Normalized<T, Z>;

export const notFound = (model: Model<any>) => {
  return new ErrorTemplate({ code: "NOT_FOUND", item: model.getName() });
};

export const invalidObjectId = () => {
  return new ErrorTemplate({ code: "CLIENT_TYPE", fields: "Object ID" });
};

const db = {
  ...read,
  ...update,
  ...create,
  ...deletes,
} as const;

export default db;
