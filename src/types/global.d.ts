import { generateDummy, restoreById, restoreOne, softDeleteById, softDeleteOne } from "@/utils/database";
import { Respond } from "../class/Response";
import { IUser, UserCred, UserRole } from "../models/User";
import { Normalized, NormalizedData, NormalizedUser } from "./types";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface User extends NormalizedData<IUser> {}
    interface Response {
      res: Respond;
    }
  }
  interface Console {
    /**
     * Console log when its not in production env
     */
    debug: typeof console.log;
    /**
     * Console table when its not in production env
     */
    debugTable: typeof console.table;
  }
}

declare module "jsonwebtoken" {
  interface JwtPayload {
    userId: string;
    expires: Date;
    verified: boolean;
    role: UserRole;
  }
}

type ExtractReturn<F> = F extends (...args: any[]) => infer R ? R : never;

declare module "mongoose" {
  interface Query<ResultType, DocType, THelpers = {}, RawDocType = DocType> {
    /**
     * Normalizes the query result into a plain object.
     * Converts ObjectId fields to strings, strips internal Mongoose fields,
     * and formats nested documents consistently.
     * @returns Normalized query result
     */
    normalize(): Promise<Normalized<DocType, ResultType, null>>;

    /**
     * Specialized normalization for user documents.
     * Removes sensitive fields like password, googleId, and optionally guest-specific fields.
     * @returns Normalized user query result
     */
    normalizeUser(): Promise<NormalizedUser<DocType, ResultType, null>>;
  }

  interface Document<T = any, TQueryHelpers = any, DocType = any> {
    /**
     * Normalize this document into a plain object.
     * Converts ObjectId fields to strings, strips internal Mongoose fields,
     * and formats nested documents consistently.
     * @returns Normalized document
     */
    normalize(): Normalized<DocType>;

    /**
     * Normalize this document specifically for user data.
     * Removes sensitive fields like password, googleId, and formats user fields.
     * @returns Normalized user document
     */
    normalizeUser(): NormalizedUser<DocType>;
  }

  interface Model {
    /**
     * Restore a document by its ID, reversing a soft delete.
     */
    restoreById: typeof restoreById;

    /**
     * Restore a single document matching a filter.
     */
    restoreOne: typeof restoreOne;

    /**
     * Soft-delete a document by its ID.
     */
    softDeleteById: typeof softDeleteById;

    /**
     * Soft-delete a single document matching a filter.
     */
    softDeleteOne: typeof softDeleteOne;

    /**
     * Generate dummy documents for testing purposes.
     */
    generateDummy: typeof generateDummy;

    /**
     *
     * Generate name of collection
     */
    getName: () => string;
  }
}
