import { CodeError, EitherWithKeys, Fields } from "../types/types";
import { CookieOptions, Response } from "express";
import {
  createAccessToken,
  createRefreshToken,
  fiveMin,
  oneWeeks,
  resAccessToken,
  resRefreshToken,
  resRefreshTokenSessionOnly,
} from "../utils/token";

/**
 * Authentication-related error codes.
 */
export const codeErrorAuth = ["INVALID_AUTH", "IS_BINDED", "NOT_BINDED", "INVALID_TOKEN"] as const;

/**
 * Field validation-related error codes.
 */
export const codeErrorField = ["MISSING_FIELDS", "CLIENT_FIELD"] as const;

/**
 * Client-side related error codes.
 */
export const codeErrorClient = ["TOO_MUCH_REQUEST", "SELF_REQUEST", "CLIENT_REFRESH", "IS_VERIFIED", "NOT_VERIFIED"] as const;

/**
 * Server-side related error codes.
 */
export const codeErrorServer = ["SERVER_ERROR", "NOT_FOUND", "BAD_GATEWAY"] as const;

/**
 * All possible error code values.
 */
export const CodeErrorValues = [...codeErrorAuth, ...codeErrorField, ...codeErrorClient, ...codeErrorServer] as const;

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

const statusAlias: {
  code: CodeError[];
  status: number;
}[] = [
  { code: ["INVALID_AUTH", "INVALID_TOKEN"], status: 401 },
  { code: ["IS_BINDED", "NOT_BINDED"], status: 403 },
  { code: ["NOT_FOUND"], status: 404 },
  { code: ["CLIENT_FIELD", "MISSING_FIELDS", "SELF_REQUEST"], status: 406 },
  { code: ["TOO_MUCH_REQUEST"], status: 429 },
  { code: ["CLIENT_REFRESH"], status: 301 },
  { code: ["SERVER_ERROR"], status: 500 },
  { code: ["BAD_GATEWAY"], status: 502 },
];

/**
 * Standard response envelope.
 */
export interface DataToResponse<T> {
  meta: {
    /** Status of response (SUCCESS/ERROR) */
    status: "ERROR" | "SUCCESS";
    /** Indicates whether there is next data (for pagination) */
    hasNext: boolean;
    /** Next offset for pagination */
    nextOffset: number | null;
    /** Optional notification message */
    notification?: string;
  };
  /** Response payload data */
  data: T;
}

/**
 * Represents a structured custom error to response.
 * Can categorize error types and optionally indicate which field caused the error.
 */
export class ErrorResponse {
  /** The error code, must be one of the CodeError union */
  code: CodeError;

  /** Human-readable title for UI display (e.g., popup) */
  message: string;

  /** Detailed message describing the error */
  title?: string;

  /** Optional extra details */
  details?: string;

  /** Optional field name that caused the error (useful for form validation) */
  field?: Fields;

  /** Optional status for response */
  status?: number;

  /**
   * @param {ErrorResponseType} params Error response parameters
   */
  constructor({ code, message, title, details, field, status }: ErrorResponseType) {
    this.code = code;
    this.message = message;
    this.title = title;
    this.details = details;
    this.field = field;
    this.status = status;
  }

  /**
   * Sends the error response to client with proper status code.
   *
   * @param {Response} res Express response object
   */
  response(res: Response) {
    const dataToRes = { message: this.message, code: this.code } as ErrorResponseType;
    if (this.title) dataToRes.title = this.title;
    if (this.details) dataToRes.details = this.details;
    if (this.field) dataToRes.field = this.field;
    const status = this.status ?? statusAlias.find((s) => s.code.includes(this.code))?.status ?? 500;

    res.status(status).json({ meta: { status: "ERROR" }, data: dataToRes } as DataToResponse<ErrorResponseType>);
  }
}

/**
 * Utility function for creating an ErrorResponse instance.
 */
export function ErrorRes(params: ErrorResponseType) {
  return new ErrorResponse(params);
}

type CookieUser = { _id: string | unknown; verified: boolean };
type CookieType = EitherWithKeys<
  {
    template: "REFRESH" | "ACCESS" | "REFRESH_ACCESS";
  },
  {
    name: string;
    val: string;
    options: CookieOptions;
  }
> & { user?: CookieUser; rememberMe?: boolean };

interface RespondOptions {
  cookie?: CookieType;
  paginateMeta?: { limit: number; offset: number };
  notif?: string;
}

/**
 * Respond utility class for standardized success responses.
 *
 * @template T Response body type
 */
export class Respond<T = any> {
  private res: Response;
  private jsonBody: DataToResponse<typeof this.body> | DataToResponse<(typeof this.body)[]>;
  private paginateMeta: RespondOptions["paginateMeta"];
  private cookie: RespondOptions["cookie"];

  body?: T;
  accessToken?: string;
  refreshToken?: string;

  /**
   * @param {Response} res Express response object
   * @param {T} body Response body
   * @param {RespondOptions} options Extra options like cookie/pagination
   */
  constructor(res: Response, body?: T, options?: RespondOptions) {
    const { cookie, paginateMeta, notif } = options ?? {};
    this.res = res;
    this.cookie = cookie;
    this.body = body;
    this.paginateMeta = paginateMeta;
    this.jsonBody = { meta: { status: "SUCCESS", hasNext: false, nextOffset: null, notification: notif }, data: body };

    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        const value = Reflect.get(res, prop, receiver);
        if (typeof value === "function") {
          return value.bind(res);
        }
        return value;
      },
    });
  }

  /**
   * Apply pagination to the response body.
   */
  paginate() {
    if (Array.isArray(this.body) && this.paginateMeta) {
      const { limit, offset } = this.paginateMeta;
      const hasNext = this.body.length > limit;
      const nextOffset = hasNext ? offset + limit : null;

      const data = hasNext ? this.body.slice(0, limit) : this.body;

      this.jsonBody.data = data;
      this.jsonBody.meta.hasNext = hasNext;
      this.jsonBody.meta.nextOffset = nextOffset;
    }
    return this;
  }

  /**
   * Generate access and refresh tokens if cookie option is provided.
   */
  generateTokens() {
    if (this.cookie) {
      let { user, rememberMe } = this.cookie;
      if (!user) user = this.body as CookieUser;
      const { _id: userId, verified } = user as { _id: string; verified: boolean };
      this.accessToken = createAccessToken({ userId, verified, expires: new Date(Date.now() + fiveMin) });
      this.refreshToken = createRefreshToken({ userId, verified, expires: new Date(Date.now() + oneWeeks * 1.5) }, rememberMe ? undefined : null);
    }
    return this;
  }

  /**
   * Send cookies to client (access/refresh/custom).
   */
  sendCookie() {
    if (this.cookie) {
      const { name, options, rememberMe, template, val } = this.cookie;
      if (!this.accessToken || !this.refreshToken) this.generateTokens();

      switch (template) {
        case "ACCESS":
          this.res.cookie("accessToken", this.accessToken, resAccessToken);
          break;
        case "REFRESH":
          this.res.cookie("refreshToken", this.refreshToken, rememberMe ? resRefreshToken : resRefreshTokenSessionOnly);
          break;
        case "REFRESH_ACCESS":
          this.res.cookie("accessToken", this.accessToken, resAccessToken);
          this.res.cookie("refreshToken", this.refreshToken, rememberMe ? resRefreshToken : resRefreshTokenSessionOnly);
          break;
        default:
          this.res.cookie(name, val, options);
      }
    }
    return this;
  }

  /**
   * Standard 200 OK response.
   */
  response() {
    return this.res.status(200).json(this.jsonBody);
  }

  /**
   * Standard 204 No Content response.
   */
  noContent() {
    return this.res.status(204).send();
  }

  /**
   * Standard 201 Created response.
   */
  created() {
    return this.res.status(201).json(this.jsonBody);
  }
}

/** Allow Respond to inherit all Response methods except cookie. */
export interface Respond extends Omit<Response, "cookie"> {}

/**
 * Helper function to create a Respond instance.
 */
export function Res<T>(res: Response, body?: T, options?: RespondOptions) {
  return new Respond(res, body, options);
}
