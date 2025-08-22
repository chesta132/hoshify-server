import { Respond } from "../class/Response";
import { IUser } from "../models/User";
import { NormalizedData } from "./types";
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
  }
}
