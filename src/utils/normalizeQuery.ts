import mongoose from "mongoose";
import { omit } from "./manipulate";
import { NormalizedData } from "../types/types";
import { IUser } from "../models/User";

export const traverseAndNormalize = (data: any, mongo = true): any => {
  if (mongo && !data?._id && !Array.isArray(data)) {
    return data;
  }

  if (!mongo && (data === null || typeof data !== "object" || data instanceof Date)) {
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
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      normalizedObject[key] = traverseAndNormalize(data[key]);
    }
  }

  return normalizedObject;
};

export const traverseHandleIdAndV = (data: any, mongo = true): any => {
  if (mongo && !data?._id && !Array.isArray(data)) {
    return data;
  }

  if (!mongo && (data === null || typeof data !== "object" || data instanceof Date)) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => traverseHandleIdAndV(item));
  }

  for (const key in data) {
    data[key] = traverseHandleIdAndV(data[key]);
  }
  data = omit(data, ["__v", "_id"]);

  if (data?._id) return { id: data._id, ...data };
  return data;
};

export const normalizeQuery = <T extends Record<string, any> | Record<string, any>[]>(queryData: T) => {
  if (Array.isArray(queryData)) {
    const normalizedData = queryData.map((queryDT) => {
      let data = queryDT;
      if (queryDT.lean) {
        data = queryDT.lean();
      } else if (queryDT.toObject) {
        data = queryDT.toObject();
      }
      return traverseHandleIdAndV(traverseAndNormalize(data));
    });
    return normalizedData as NormalizedData<T>[];
  }

  let data = queryData;
  if (queryData.lean) {
    data = queryData.lean();
  } else if (queryData.toObject) {
    data = queryData.toObject();
  }
  const normalizedData = traverseHandleIdAndV(traverseAndNormalize(data));
  return normalizedData as NormalizedData<T>;
};

export const normalizeUserQuery = <T extends Partial<IUser> | NormalizedData<IUser>>(queryData: T, options?: { isGuest?: boolean }) => {
  let data = omit(queryData, ["password", "googleId"]);
  if (queryData._id instanceof mongoose.Types.ObjectId) {
    data = normalizeQuery(data as Record<string, any>) as Omit<T, "password" | "googleId">;
  }
  if (options?.isGuest) {
    delete data.gmail;
    delete data.email;
    delete data.verified;
    delete data.createdAt;
  }
  return data as unknown as NormalizedData<T>;
};

export const userProject = (isGuest?: boolean) => {
  const def = { password: false, googleId: false };

  if (isGuest) return { ...def, gmail: false, email: false, verified: false, createdAt: false, timeToAllowSendEmail: false };
  else return def;
};
