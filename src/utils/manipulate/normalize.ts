import { omit } from "./object";
import { NormalizedQuery, NormalizedUser, RequireAtLeastOne } from "@/types";
import { currencyFields, CurrencyFields, formatCurrency, ModifiedCurrency } from "../money";
import { TUser, UserCred, UserCreds } from "@/services/db/User";

const shouldProcess = (data: any): boolean => {
  return data?._id || Array.isArray(data);
};

export const normalizable = ["dummy"] as const;
export type NormalizeFields = (typeof normalizable)[number];

const normalize = <T extends object | object[]>(data: T): IsArray<T, NormalizedQuery<ExtractArray<T>>[], NormalizedQuery<T>> => {
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
    } else if (processedData[key].toString) {
      processedData[key] = processedData[key].toString();
    }
  }

  const cleanedData = omit(processedData, normalizable as any);

  return cleanedData as any;
};

export const normalizeQuery = <T extends Record<string, any> | Record<string, any>[]>(queryData: T) => {
  if (Array.isArray(queryData)) {
    return queryData.map((data) => normalize({ ...data }));
  } else {
    return normalize({ ...queryData });
  }
};

export const normalizeUserQuery = <T extends Partial<TUser>, G extends boolean = false>(queryData: T, options?: { isGuest?: G }) => {
  let data = omit(queryData, UserCreds);
  if (options?.isGuest) {
    delete data.gmail;
    delete data.email;
    delete data.verified;
    delete data.createdAt;
  }
  return data as NormalizedUser<T, G>;
};

export type NormalizeCurrecyData = RequireAtLeastOne<Record<CurrencyFields, number>>;
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
