import { codeErrorAuth, codeErrorClient, codeErrorField, codeErrorServer, CodeErrorValues } from "../class/Response";
import { UserCred } from "@/models/User";
import { Response, Request } from "express";
import { Settings } from "@/services/crud";

export type Fields = "password" | "newPassword" | "email" | "newEmail" | "newFullName" | "token" | "type" | "refreshMoney";

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

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type EitherWithKeys<Keys extends object, Others extends object> =
  | (Keys & { [K in keyof Others]?: undefined })
  | (Others & { [K in keyof Keys]?: never });

export type NormalizedUser<T> = T extends any[] ? Omit<ExtractArray<T>, UserCred>[] : Omit<T, UserCred>;

export type UnionToInter<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export interface ControllerOptions<T> {
  filter?: RootFilterQuery<T>;
  settings?: Settings<T>;
  funcBeforeRes?: (data: T, req: Request, res: Response["res"]) => any;
  funcInitiator?: (req: Request, res: Response["res"]) => Promise<"stop"> | "stop" | Promise<void> | void;
}
export type ControllerConfig<T, F> = RequireAtLeastOne<{
  neededField: F[];
  acceptableField: Exclude<keyof T, F>[];
}>;
