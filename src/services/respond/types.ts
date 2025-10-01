import { Fields } from "@/types/client";
import { CodeError } from "../error/types";
import { Respond } from "./Respond";
import { EitherWithKeys } from "@/types";
import { CookieOptions } from "express";
import { $Enums } from "@prisma/client";

/**
 * Structure of an error response payload.
 */
export interface ErrorResponseType {
  /** Unique error code */
  code: CodeError;
  /** Human-readable message */
  message: string;
  /** Optional UI title for displaying error */
  title?: string;
  /** Extra details for debugging */
  details?: string;
  /** Optional field reference (useful for forms) */
  field?: Fields;
  /** HTTP status code override */
  status?: number;
}

export interface RestError extends Omit<ErrorResponseType, "message" | "code"> {}

/**
 * Standard response envelope.
 */
export interface DataToResponse<T> {
  meta: {
    /** Status of response (SUCCESS/ERROR) */
    status: "ERROR" | "SUCCESS";
    /** Indicates whether there is next data (for pagination) */
    hasNext?: boolean;
    /** Next offset for pagination */
    nextOffset?: number | null;
    /** Optional information message */
    information?: string;
  };
  /** Response payload data */
  data: T;
}

export type Responded = Respond<unknown, false, false>;

export type ResType<SuccessReady extends boolean, ErrorReady extends boolean> = IsTruthy<
  SuccessReady,
  () => Responded,
  IsTruthy<ErrorReady, () => Responded>
>;

export type CookieUserBase = { id: string | unknown; verified: boolean; role: $Enums.UserRole };
export type CookieUser<T> = T extends CookieUserBase ? { user?: CookieUserBase } : { user: CookieUserBase };

export type CookieType<T = undefined> = EitherWithKeys<
  {
    template: "REFRESH" | "ACCESS" | "REFRESH_ACCESS";
  },
  {
    name: string;
    val: string;
    options: CookieOptions;
  }
> & { rememberMe?: boolean } & CookieUser<T>;

export interface RespondOptions<T = undefined> {
  cookie: CookieType<T>;
  paginateMeta: { limit: number; offset: number };
  notif: string;
}
