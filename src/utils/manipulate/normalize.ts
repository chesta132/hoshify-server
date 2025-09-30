import { omit } from "./object";
import { NormalizedUser, RequireAtLeastOne } from "@/types";
import { IUser, USER_CRED } from "@/models/User";
import { currencyFields, CurrencyFields, formatCurrency, ModifiedCurrency } from "../money";

const shouldProcess = (data: any): boolean => {
  return data?._id || Array.isArray(data);
};

export const normalizable = ["dummy"] as const;
export type NormalizeFields = (typeof normalizable)[number];

const normalize = <T extends object | object[]>(data: T): IsArray<T, Omit<ExtractArray<T>, NormalizeFields>[], Omit<T, NormalizeFields>> => {
  if (!shouldProcess(data)) {
    return data as any;
  }

  if (Array.isArray(data)) {
    return data.map((item) => normalize(item)) as any;
  }

  const processedData = { ...data } as any;
  for (const key in processedData) {
    if (processedData?.hasOwnProperty(key)) {
      processedData[key] = normalize(processedData[key]);
    }
  }

  const cleanedData = omit(processedData, normalizable as any);

  return cleanedData as any;
};

export const normalizeQuery = <T extends Record<string, any> | Record<string, any>[]>(queryData: T) => {
  if (Array.isArray(queryData)) {
    const normalizedData = queryData.map((dat) => {
      const data = { ...dat };
      return normalize(data);
    });
    return normalizedData;
  }

  const data = { ...queryData };
  const normalizedData = normalize(data);
  return normalizedData;
};

export const normalizeUserQuery = <T extends Partial<IUser>>(queryData: T, options?: { isGuest?: boolean }) => {
  let data = omit(queryData, USER_CRED) as NormalizedUser<T>;
  if (options?.isGuest) {
    delete data.gmail;
    delete data.email;
    delete data.verified;
    delete data.createdAt;
  }
  return data;
};

type NormalizeCurrecyData = RequireAtLeastOne<Record<CurrencyFields, number>>;
export const normalizeCurrency = <T extends NormalizeCurrecyData | NormalizeCurrecyData[]>(
  queryData: T,
  currency: string
): ModifiedCurrency<ExtractArray<T>> => {
  if (Array.isArray(queryData)) {
    return queryData.map((data) => normalizeCurrency(data, currency)) as ModifiedCurrency<ExtractArray<T>>;
  }

  let data = { ...queryData };
  for (const [key, value] of Object.entries(data) as [string, number][]) {
    if (currencyFields.includes(key as any)) (data as any)[key] = formatCurrency(value, currency);
  }
  return data as ModifiedCurrency<ExtractArray<T>>;
};
