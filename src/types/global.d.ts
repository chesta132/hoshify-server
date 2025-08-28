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
    normalize(): Promise<Normalized<DocType, ResultType, null>>;
    normalizeUser(): Promise<NormalizedUser<DocType, ResultType, null>>;
  }

  interface Model<TRawDocType> {
    restoreById: typeof restoreById;
    restoreOne: typeof restoreOne;
    softDeleteById: typeof softDeleteById;
    softDeleteOne: typeof softDeleteOne;
    generateDummy: typeof generateDummy;
  }

  interface Document<T = any, TQueryHelpers = any, DocType = any> {
    normalize(): Normalized<DocType>;
    normalizeUser(): NormalizedUser<DocType>;
  }
}
