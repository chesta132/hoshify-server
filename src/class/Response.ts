import { CodeError, EitherWithKeys, Fields, OneFieldOnly } from "../types/types";
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
export const codeErrorAuth = ["INVALID_AUTH", "IS_BOUND", "NOT_BOUND", "INVALID_TOKEN"] as const;

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

interface RestError extends Omit<ErrorResponseType, "title" | "message" | "code"> {}

const statusAlias: {
  code: CodeError[];
  status: number;
}[] = [
  { code: ["INVALID_AUTH", "INVALID_TOKEN"], status: 401 },
  { code: ["IS_BOUND", "NOT_BOUND"], status: 403 },
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
    hasNext?: boolean;
    /** Next offset for pagination */
    nextOffset?: number | null;
    /** Optional notification message */
    notification?: string;
  };
  /** Response payload data */
  data: T;
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
  cookie: CookieType;
  paginateMeta: { limit: number; offset: number };
  notif: string;
}

const defaultBody = <T>(): DataToResponse<T> => ({ data: {} as T, meta: { status: "ERROR" } });

/**
 * Wrapper for Express Response object with method chaining.
 * Provides utilities for standardized success/error responses and extra features.
 */
export class Respond<SuccessType = unknown> {
  private _jsonBody: DataToResponse<typeof this._body | typeof this._errorBody> = defaultBody();
  private _body?: SuccessType | SuccessType[];
  private _errorBody?: ErrorResponseType;
  private _accessToken?: string;
  private _refreshToken?: string;
  private _res: Response;

  /**
   * Initialize Respond with the original Response.
   * Uses Proxy to fallback to the underlying Express Response methods and properties.
   */
  constructor(res: Response) {
    this._res = res;
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        const value = (res as any)[prop as any];
        return typeof value === "function" ? value.bind(res) : value;
      },
    });
  }

  // private buildJsonBody(callback: () => this | void, reset = true, success = true) {
  //   this._jsonBody.meta.status = success ? "SUCCESS" : "ERROR";
  //   this._jsonBody.data = success ? this._body : this._errorBody;
  //   callback();
  //   if (reset) {
  //     this._body = undefined;
  //     this._errorBody = undefined;
  //     this._jsonBody = defaultBody();
  //   }
  //   return this;
  // }

  private reset() {
    this._body = undefined;
    this._errorBody = undefined;
    this._jsonBody = defaultBody();
    this._accessToken = undefined;
    this._refreshToken = undefined;
  }

  private finalize(success: boolean) {
    this._jsonBody.meta.status = success ? "SUCCESS" : "ERROR";
    this._jsonBody.data = success ? this._body : this._errorBody;
  }

  /**
   * Set the response body with success or error payload.
   *
   * @example
   * ```ts
   * res.body({ success: { userId: 123 } }).ok();
   * ```
   * @example
   * ```ts
   * res.body({ error: { code: "NOT_FOUND", message: "User not found" } }).error();
   * ```
   *
   * @param success Data for success response
   * @param error Data for error response
   * @returns this
   */
  body({ success, error }: OneFieldOnly<{ success: SuccessType; error: ErrorResponseType }>) {
    if (success) this._body = success;
    if (error) this._errorBody = error;
    return this;
  }

  /**
   * Add a notification message to the response metadata.
   *
   * @example
   * ```ts
   * res.notif("Profile updated successfully")
   *    .body({ success: user })
   *    .ok();
   * ```
   *
   * @param notification Notification message
   * @returns this
   */
  notif(notification: string) {
    this._jsonBody.meta.notification = notification;
    return this;
  }

  /**
   * Apply pagination metadata to the response body (if the body is an array).
   *
   * @example
   * ```ts
   * res.body({ success: users })
   *    .paginate({ limit: 10, offset: 0 })
   *    .ok();
   * ```
   *
   * @param paginateMeta Pagination options (limit, offset)
   * @returns this
   */
  paginate(paginateMeta: RespondOptions["paginateMeta"]) {
    if (Array.isArray(this._body)) {
      const { limit, offset } = paginateMeta;
      const hasNext = this._body.length > limit;
      const nextOffset = hasNext ? offset + limit : null;

      const data = hasNext ? this._body.slice(0, limit) : this._body;

      this._jsonBody.data = data;
      this._jsonBody.meta.hasNext = hasNext;
      this._jsonBody.meta.nextOffset = nextOffset;
    }
    return this;
  }

  /**
   * Generate access and refresh tokens for the given user.
   *
   * @example
   * ```ts
   * res.body({ success: user })
   *    .generateTokens({ user, rememberMe: true })
   *    .sendCookie({ template: "REFRESH_ACCESS", rememberMe: true })
   *    .ok();
   * ```
   *
   * @param cookie User data and options
   * @returns this
   */
  generateTokens(cookie: RespondOptions["cookie"]) {
    let { user, rememberMe } = cookie;
    if (!user) {
      if (!this._body) return this;
      user = this._body as unknown as CookieUser;
    }
    const { _id: userId, verified } = user as { _id: string; verified: boolean };
    this._accessToken = createAccessToken({ userId, verified, expires: new Date(Date.now() + fiveMin) });
    this._refreshToken = createRefreshToken({ userId, verified, expires: new Date(Date.now() + oneWeeks * 1.5) }, rememberMe ? undefined : null);
    return this;
  }

  /**
   * Send cookies to the client (access, refresh, or custom).
   *
   * @example
   * ```ts
   * res.sendCookie({ template: "ACCESS", user, rememberMe: false }).ok();
   * ```
   *
   * @param cookie Cookie configuration
   * @returns this
   */
  sendCookie(cookie: RespondOptions["cookie"]) {
    const { name, options, rememberMe, template, val } = cookie;
    const accT = this._accessToken;
    const refT = this._refreshToken;
    if (!accT || !refT) {
      if (!this._body && !cookie.user) return this;
      else if (template) this.generateTokens(cookie);
    }

    switch (template) {
      case "ACCESS":
        this._res.cookie("accessToken", accT, resAccessToken);
        break;
      case "REFRESH":
        this._res.cookie("refreshToken", refT, rememberMe ? resRefreshToken : resRefreshTokenSessionOnly);
        break;
      case "REFRESH_ACCESS":
        this._res.cookie("accessToken", accT, resAccessToken);
        this._res.cookie("refreshToken", refT, rememberMe ? resRefreshToken : resRefreshTokenSessionOnly);
        break;
      default:
        this._res.cookie(name, val, options);
    }
    this._accessToken = undefined;
    this._refreshToken = undefined;
    return this;
  }

  /**
   * Smart send success or error.
   *
   * @example
   * ```ts
   * res.notif("User has been updated").body({ success: updatedUser }).respond();
   * ```
   *
   * @returns this
   */
  respond() {
    this.finalize(true);
    if (this._body) {
      this.ok();
    } else if (this._errorBody) {
      this.error();
    }
    this.reset();
    return this;
  }

  /**
   * Send a standard 200 OK response.
   *
   * @example
   * ```ts
   * res.notif("Fetched user data").body({ success: user }).ok();
   * ```
   *
   * @returns this
   */
  ok() {
    this.finalize(true);
    if (this._body) {
      this._res.status(200).json(this._jsonBody);
    }
    this.reset();
    return this;
  }

  /**
   * Send a standard 204 No Content response.
   *
   * @example
   * ```ts
   * res.noContent();
   * ```
   *
   * @returns this
   */
  noContent() {
    this.finalize(true);
    this._res.status(204).json(this._jsonBody);
    this.reset();
    return this;
  }

  /**
   * Send a standard 201 Created response.
   *
   * @example
   * ```ts
   * res.body({ success: newUser }).created();
   * ```
   *
   * @returns this
   */
  created() {
    this.finalize(true);
    if (this._body) {
      this._res.status(201).json(this._jsonBody);
    }
    this.reset();
    return this;
  }

  /**
   * Send an error response using ErrorResponseType.
   *
   * @example
   * ```ts
   * res.body({
   *   error: { code: "INVALID_AUTH", message: "Invalid token", status: 401 }
   * }).error();
   * ```
   *
   * @returns this
   */
  error() {
    this.finalize(false);
    const errorBody = this._errorBody;
    if (errorBody) {
      const status = errorBody.status ?? statusAlias.find((s) => s.code.includes(errorBody.code))?.status ?? 500;
      this._res.status(status).json(this._jsonBody);
    }
    this.reset();
    return this;
  }

  /**
   * Respond with a missing fields error.
   *
   * @example
   * ```ts
   * res.tempMissingFields("email");
   * ```
   *
   * @param fields Name of the missing fields
   * @param restErr Additional error properties
   * @returns this
   */
  tempMissingFields(fields: string, restErr?: RestError) {
    this.body({ error: { ...restErr, title: "Missing Fields", message: `${fields.capital()} is required`, code: "MISSING_FIELDS" } });
    return this;
  }

  /**
   * Respond with a client field error.
   *
   * @example
   * ```ts
   * res.tempClientField("username", "Username is invalid");
   * ```
   *
   * @param err Field name & Error message causing the error
   * @returns this
   */
  tempClientField(err: Omit<ErrorResponseType, "code">) {
    this.body({ error: { code: "CLIENT_FIELD", ...err } });
    return this;
  }

  /**
   * Respond with an invalid OTP error.
   *
   * @example
   * ```ts
   * res.tempInvalidOTP();
   * ```
   *
   * @param restErr Additional error properties
   * @returns this
   */
  tempInvalidOTP(restErr?: Omit<RestError, "field">) {
    this.body({
      error: {
        ...restErr,
        title: "Invalid OTP",
        message: "Invalid or expired OTP. Please request a new OTP code.",
        code: "CLIENT_FIELD",
        field: "otp",
      },
    });
    return this;
  }

  /**
   * Respond with an authentication error.
   *
   * @example
   * ```ts
   * res.tempInvalidAuth();
   * ```
   *
   * @param restErr Additional error properties
   * @returns this
   */
  tempInvalidAuth(restErr?: RestError) {
    this.body({
      error: {
        ...restErr,
        title: "Authentication needed",
        message: "Authentication needed please back to dashboard or change your account",
        code: "INVALID_AUTH",
      },
    });
    return this;
  }

  /**
   * Respond with an invalid token error.
   *
   * @example
   * ```ts
   * res.tempInvalidToken();
   * ```
   *
   * @param restErr Additional error properties
   * @returns this
   */
  tempInvalidToken(restErr?: RestError) {
    this.body({
      error: {
        ...restErr,
        title: "Invalid Session",
        message: "Invalid token please re-signin to refresh your session",
        code: "INVALID_TOKEN",
      },
    });
    return this;
  }

  /**
   * Respond with a not found error.
   *
   * @example
   * ```ts
   * res.tempNotFound("User");
   * ```
   *
   * @param item Item name
   * @param desc Optional description
   * @param restErr Additional error properties
   * @returns this
   */
  tempNotFound(item: string, desc?: string, restErr?: RestError) {
    this.body({
      error: {
        ...restErr,
        title: "Not Found",
        message: `${item.capital()} not found${desc ? `. ${desc.capital()}` : ""}`,
        code: "NOT_FOUND",
      },
    });
    return this;
  }

  /**
   * Respond when account is already bound.
   *
   * @example
   * ```ts
   * res.tempIsBound("google");
   * ```
   *
   * @param provider Optional provider name
   * @param restErr Additional error properties
   * @returns this
   */
  tempIsBound = (provider?: string, restErr?: RestError) => {
    this.body({
      error: { ...restErr, code: "IS_BOUND", message: `Account is already bound to ${provider ?? "local"}`, title: "Account already bounded" },
    });
    return this;
  };

  /**
   * Respond when account is not bound.
   *
   * @example
   * ```ts
   * res.tempNotBound("google");
   * ```
   *
   * @param provider Optional provider name
   * @param restErr Additional error properties
   * @returns this
   */
  tempNotBound(provider?: string, restErr?: RestError) {
    this.body({
      error: {
        ...restErr,
        message: `Account is not bounded to ${provider ?? "local"} yet, please bind to ${provider ?? "local"} first`,
        code: "NOT_BOUND",
        title: "Account is not bounded",
      },
    });
    return this;
  }

  /**
   * Respond with too many requests error.
   *
   * @example
   * ```ts
   * res.tempTooMuchReq("Rate limit exceeded");
   * ```
   *
   * @param desc Optional description
   * @param restErr Additional error properties
   * @returns this
   */
  tempTooMuchReq(desc?: string, restErr?: RestError) {
    this.body({
      error: {
        ...restErr,
        title: "Too many requests",
        message: `Too many requests. ${desc?.capital() ?? "Please try again later"}`,
        code: "TOO_MUCH_REQUEST",
      },
    });
    return this;
  }

  /**
   * Respond with limit send email error.
   *
   * @example
   * ```ts
   * res.tempLimitSendEmail();
   * ```
   *
   * @param restErr Additional error properties
   * @returns this
   */
  tempLimitSendEmail(restErr?: RestError) {
    this.body({
      error: {
        ...restErr,
        title: "Too much request",
        message: "Too much request, please request to send mail again later",
        code: "TOO_MUCH_REQUEST",
      },
    });
    return this;
  }

  /**
   * Respond when email is already verified.
   *
   * @example
   * ```ts
   * res.tempIsVerified();
   * ```
   *
   * @param restErr Additional error properties
   * @returns this
   */
  tempIsVerified(restErr?: RestError) {
    this.body({ error: { ...restErr, message: "Your email has been verified", code: "IS_VERIFIED", title: "You have been verified" } });
    return this;
  }

  /**
   * Respond when account is not verified.
   *
   * @example
   * ```ts
   * res.tempNotVerified();
   * ```
   *
   * @param restErr Additional error properties
   * @returns this
   */
  tempNotVerified(restErr?: RestError) {
    this.body({
      error: {
        ...restErr,
        message: "Insufficient permissions, please verify your account",
        code: "NOT_VERIFIED",
        title: "Insufficient permissions",
      },
    });
    return this;
  }

  /**
   * Respond when a user tries to perform a self request.
   *
   * @example
   * ```ts
   * res.tempSelfReq();
   * ```
   *
   * @param restErr Additional error properties
   * @returns this
   */
  tempSelfReq(restErr?: RestError) {
    this.body({
      error: {
        ...restErr,
        message: "Can not self request, please report this issue to Hoshify Team",
        title: "Self request detected",
        code: "SELF_REQUEST",
      },
    });
  }
}

/**
 * Extends Express Response with Respond features.
 */
export interface Respond extends Response {}
