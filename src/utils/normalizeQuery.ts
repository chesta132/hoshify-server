import mongoose from "mongoose";
import { omit } from "./manipulate";
import { NormalizedData } from "../types/types";
import { IUser } from "../models/User";

const shouldProcessMongo = (data: any): boolean => {
  return data?._id || Array.isArray(data);
};

const isPrimitive = (data: any): boolean => {
  return data === null || typeof data !== "object" || data instanceof Date;
};

const objecting = (data: any) => {
  if (data.lean) {
    return data.lean();
  } else if (data.toObject) {
    return data.toObject();
  }
  return data;
};

export const traverseAndNormalize = (data: any, mongo = true): any => {
  if (mongo && !shouldProcessMongo(data)) {
    return data;
  }

  if (!mongo && isPrimitive(data)) {
    return data;
  }

  if (data instanceof mongoose.Types.ObjectId) {
    return data.toString();
  }

  if (Array.isArray(data)) {
    return data.map((item) => traverseAndNormalize(item, mongo));
  }

  const normalizedObject: { [key: string]: any } = {};
  for (const key in data) {
    if (data?.hasOwnProperty(key)) {
      normalizedObject[key] = traverseAndNormalize(data[key], mongo);
    }
  }

  return normalizedObject;
};

export const traverseHandleIdAndV = (data: any, mongo = true): any => {
  if (mongo && !shouldProcessMongo(data)) {
    return data;
  }

  if (!mongo && isPrimitive(data)) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => traverseHandleIdAndV(item, mongo));
  }

  const processedData = objecting(data);
  for (const key in processedData) {
    if (processedData?.hasOwnProperty(key)) {
      processedData[key] = traverseHandleIdAndV(processedData[key], mongo);
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
      return traverseHandleIdAndV(traverseAndNormalize(data));
    });
    return normalizedData as NormalizedData<T>[];
  }

  const data = objecting(queryData);
  const normalizedData = traverseHandleIdAndV(traverseAndNormalize(data));
  return normalizedData as NormalizedData<T>;
};

export const normalizeUserQuery = <T extends Partial<IUser> | NormalizedData<IUser>>(queryData: T, options?: { isGuest?: boolean }) => {
  let data = omit(queryData, ["password", "googleId", "currency"]);
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

export const userProject = (isGuest?: boolean) => {
  const def = { password: false, googleId: false };

  if (isGuest) return { ...def, gmail: false, email: false, verified: false, createdAt: false, timeToAllowSendEmail: false };
  else return def;
};
