import { Document, ObjectId } from "mongoose";
import { codeErrorAuth, codeErrorClient, codeErrorField, codeErrorServer, CodeErrorValues } from "../class/Response";
import { UserCred } from "@/models/User";

export type Fields = "password" | "newPassword" | "username" | "email" | "newEmail" | "newFullName" | "token" | "type" | "refreshMoney";

export type CodeAuthError = (typeof codeErrorAuth)[number];
export type CodeFieldError = (typeof codeErrorField)[number];
export type CodeClientError = (typeof codeErrorClient)[number];
export type CodeServerError = (typeof codeErrorServer)[number];
export type CodeError = (typeof CodeErrorValues)[number];

export type OneFieldOnly<T extends Record<string, unknown>> = {
  [K in keyof T]: {
    [P in K]: T[P];
  } & {
    [P in Exclude<keyof T, K>]?: never;
  };
}[keyof T];

export type NormalizedData<T> = Omit<
  {
    [K in keyof T]: T[K] extends ObjectId ? string : T[K];
  },
  keyof Document
> & { id: string };

export type EitherWithKeys<Keys extends object, Others extends object> =
  | (Keys & { [K in keyof Others]?: undefined })
  | (Others & { [K in keyof Keys]?: never });

export type NormalizeReturn<T> = NormalizedData<T>;
// export type NormalizeReturn<T> = NormalizedData<T>;
// export type NormalizeModelReturn<ResultType, DocType> = NormalizeReturn<DocType> | null;
// export type NormalizeModelReturn<ResultType, DocType> = IsArray<ResultType, NormalizeReturn<DocType>[], NormalizeReturn<DocType> | null>;

export type NormalizeUserReturn<DocType> = Omit<NormalizedData<DocType>, UserCred>;
// export type NormalizeUserReturn<DocType> = Omit<NormalizedData<DocType>, UserCred>;
// export type NormalizeUserModelReturn<ResultType, DocType> = IsArray<ResultType, NormalizeUserReturn<DocType>[], NormalizeUserReturn<DocType> | null>;
// export type NormalizeUserModelReturn<ResultType, DocType> = NormalizeUserReturn<DocType> | null;

export type Normalized<DocType, ResultType = DocType, IfObject = never> = ResultType extends any[]
  ? NormalizedData<DocType>[]
  : NormalizedData<DocType> | IfObject;
export type NormalizedUser<DocType, ResultType = DocType, IfObject = never> = ResultType extends any[]
  ? NormalizeUserReturn<DocType>[]
  : NormalizeUserReturn<DocType> | IfObject;
