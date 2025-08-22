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
    if (Object.prototype.hasOwnProperty.call(data, key)) {
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

  const processedData = { ...data };
  for (const key in processedData) {
    if (processedData.hasOwnProperty(key)) {
      processedData[key] = traverseHandleIdAndV(processedData[key], mongo);
    }
  }

  const cleanedData = omit(processedData, ["__v", "_id"]);

  if (processedData._id) {
    return { id: processedData._id, ...cleanedData };
  }

  return cleanedData;
};

export const normalizeQuery = <T extends Record<string, any> | Record<string, any>[]>(queryData: T) => {
  if (Array.isArray(queryData)) {
    const normalizedData = queryData.map((data) => {
      objecting(data);
      return traverseHandleIdAndV(traverseAndNormalize(data));
    });
    return normalizedData as NormalizedData<T>[];
  }

  let data = queryData;
  objecting(data);
  const normalizedData = traverseHandleIdAndV(traverseAndNormalize(data));
  return normalizedData as NormalizedData<T>;
};

export const normalizeUserQuery = <T extends Partial<IUser> | NormalizedData<IUser>>(queryData: T, options?: { isGuest?: boolean }) => {
  let data = omit(queryData, ["password", "googleId"]);
  if ((queryData as Partial<IUser>)._id instanceof mongoose.Types.ObjectId) {
    data = normalizeQuery(data as Record<string, any>) as Omit<T, "password" | "googleId">;
  }
  if (options?.isGuest) {
    delete data.gmail;
    delete data.email;
    delete data.verified;
    delete data.createdAt;
  }
  return data as unknown as NormalizedData<Omit<T, "password" | "googleId">>;
};

export const userProject = (isGuest?: boolean) => {
  const def = { password: false, googleId: false };

  if (isGuest) return { ...def, gmail: false, email: false, verified: false, createdAt: false, timeToAllowSendEmail: false };
  else return def;
};
