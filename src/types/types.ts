import { Document, ObjectId } from "mongoose";
import { codeErrorAuth, codeErrorClient, codeErrorField, codeErrorServer, CodeErrorValues } from "../class/Response";

export type Fields = "password" | "newPassword" | "username" | "email" | "newEmail" | "otp" | "newFullName";

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

export type ConditionalFunc<Conditions extends boolean, Func extends Function, Fallback = undefined> = Conditions extends true
  ? Func
  : Fallback extends undefined
  ? never
  : Fallback;
