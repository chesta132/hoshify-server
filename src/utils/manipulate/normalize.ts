import mongoose from "mongoose";
import { omit } from "./object";
import { Normalized, NormalizedData, RequireAtLeastOne } from "@/types";
import { IUser, USER_CRED, UserCred } from "@/models/User";
import { currencyFields, CurrencyFields, formatCurrency, ModifiedCurrency } from "../money";

const shouldProcess = (data: any): boolean => {
  return data?._id || Array.isArray(data);
};

const objecting = <T extends Record<string, any>>(data: T) => {
  return (data?.toObject ? data.toObject() : { ...data }) as T;
};

export const traverseAndNormalize = (data: any): any => {
  if (!shouldProcess(data)) {
    return data;
  }

  if (data instanceof mongoose.Types.ObjectId) {
    return data.toString();
  }

  if (Array.isArray(data)) {
    return data.map((item) => traverseAndNormalize(item));
  }

  const normalizedObject: { [key: string]: any } = {};
  for (const key in data) {
    if (data?.hasOwnProperty(key)) {
      normalizedObject[key] = traverseAndNormalize(data[key]);
    }
  }

  return normalizedObject;
};

export const traverseHandleField = (data: any): any => {
  if (!shouldProcess(data)) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => traverseHandleField(item));
  }

  const processedData = objecting(data);
  for (const key in processedData) {
    if (processedData?.hasOwnProperty(key)) {
      processedData[key] = traverseHandleField(processedData[key]);
    }
  }

  const cleanedData = omit(processedData, ["__v", "_id", "dummy"]);

  if (processedData._id && !processedData.id) {
    return { id: processedData._id, ...cleanedData };
  }

  return cleanedData;
};

export const normalizeQuery = <T extends Record<string, any> | Record<string, any>[]>(queryData: T) => {
  if (Array.isArray(queryData)) {
    const normalizedData = queryData.map((dat) => {
      const data = objecting(dat);
      return traverseHandleField(traverseAndNormalize(data));
    });
    return normalizedData as NormalizedData<T>[];
  }

  const data = objecting(queryData);
  const normalizedData = traverseHandleField(traverseAndNormalize(data));
  return normalizedData as NormalizedData<T>;
};

export const normalizeUserQuery = <T extends Partial<IUser> | NormalizedData<IUser>>(queryData: T, options?: { isGuest?: boolean }) => {
  let data = omit(queryData, USER_CRED);
  if ((queryData as Partial<IUser>)._id instanceof mongoose.Types.ObjectId) {
    data = normalizeQuery(data as Record<string, any>) as typeof data;
  }
  if (options?.isGuest) {
    delete data.gmail;
    delete data.email;
    delete data.verified;
    delete data.createdAt;
  }
  return data as unknown as NormalizedData<typeof data>;
};

export const userProject = () => {
  const def = {} as Record<UserCred, boolean>;
  USER_CRED.forEach((field) => (def[field] = false));
  return def;
};

type NormalizeCurrecyData = RequireAtLeastOne<Record<CurrencyFields, number>>;
export const normalizeCurrency = <T extends NormalizeCurrecyData | NormalizeCurrecyData[]>(
  queryData: T,
  currency: string
): Normalized<ModifiedCurrency<T extends any[] ? T[number] : T>> => {
  if (Array.isArray(queryData)) {
    return queryData.map((data) => normalizeCurrency(data, currency)) as Normalized<ModifiedCurrency<T extends any[] ? T[number] : T>>;
  }

  let data: Normalized<T> | T = objecting(queryData) as T;
  for (const [key, value] of Object.entries(data) as [string, number][]) {
    if (currencyFields.includes(key as any)) (data as any)[key] = formatCurrency(value, currency);
  }
  if ((data as any)?._id) {
    data = normalizeQuery(data) as Normalized<T>;
  }
  return data as Normalized<ModifiedCurrency<T extends any[] ? T[number] : T>>;
};
