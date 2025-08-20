import { IUser } from "../models/User";
import { SanitizedData } from "./types";

declare global {
  namespace Express {
    interface User extends IUser {}
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

declare module "mongoose" {
  interface Document {
    __v?: number;
  }
}

declare module "node:console" {
  global {
  }
}
