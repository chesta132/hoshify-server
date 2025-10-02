import { TUser, UserCred } from "@/services/db/User";
import { NormalizeFields } from "@/utils/manipulate/normalize";
import { Prisma } from "@prisma/client";

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

export type UnionToInter<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type NormalizedQuery<T> = Omit<T, NormalizeFields> & {
  [K in keyof T]: { toUpdate: Function } extends T[K] ? string : T[K];
};

export type NormalizedUser<T, G extends boolean = false> = Omit<
  NormalizedQuery<T>,
  G extends true ? UserCred | "gmail" | "email" | "verified" | "createdAt" : UserCred
>;
