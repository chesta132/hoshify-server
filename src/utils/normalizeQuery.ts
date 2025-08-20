import mongoose, { Document, isValidObjectId } from "mongoose";
import { omit } from "./manipulate";
import { SanitizedData } from "../types/types";
import { IUser } from "../models/User";

export const traverseAndSanitize = (data: any, mongo = true): any => {
  if (mongo && !data?._id && !Array.isArray(data)) {
    return data;
  }

  if (!mongo && (data === null || typeof data !== "object" || data instanceof Date)) {
    return data;
  }

  if (isValidObjectId(data)) {
    return data.toString();
  }

  if (Array.isArray(data)) {
    return data.map((item) => traverseAndSanitize(item));
  }

  const normalizedObject: { [key: string]: any } = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      normalizedObject[key] = traverseAndSanitize(data[key]);
    }
  }

  return normalizedObject;
};

export const traverseCreateId = (data: any, mongo = true): any => {
  if (mongo && !data?._id && !Array.isArray(data)) {
    return data;
  }

  if (!mongo && (data === null || typeof data !== "object" || data instanceof Date)) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => traverseCreateId(item));
  }

  for (const key in data) {
    data[key] = traverseCreateId(data[key]);
  }

  if (data?._id) return { id: data._id, ...data };
};

export const normalizeQuery = <T extends Document | Document[]>(queryData: T) => {
  if (Array.isArray(queryData)) {
    const normalizedData = queryData.map((queryDT) => {
      let data = omit(queryDT, ["__v"]);
      if (queryDT.toObject) {
        data = queryDT.toObject();
      }
      return traverseCreateId(traverseAndSanitize(data));
    });
    return normalizedData as SanitizedData<T>[];
  }

  let data = omit(queryData as Document, ["__v"]);
  if (queryData.toObject) {
    data = queryData.toObject();
  }
  const normalizedData = traverseCreateId(traverseAndSanitize(data));
  return normalizedData as SanitizedData<T>;
};

export const normalizeUserQuery = <T extends Partial<IUser>>(queryData: T, options?: { isGuest?: boolean }) => {
  let data = omit(queryData, ["__v", "password", "googleId"]);
  if (queryData._id instanceof mongoose.Types.ObjectId) {
    data = normalizeQuery(data as Document) as Omit<T, "__v" | "password" | "googleId">;
  }
  if (options?.isGuest) {
    delete data.gmail;
    delete data.email;
    delete data.verified;
    delete data.createdAt;
  }
  return data as SanitizedData<T>;
};

export const userProject = (isGuest?: boolean) => {
  const def = { password: false, googleId: false };

  if (isGuest) return { ...def, gmail: false, email: false, verified: false, createdAt: false, timeToAllowSendEmail: false };
  else return def;
};
