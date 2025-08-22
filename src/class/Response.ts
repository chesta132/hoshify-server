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

export type ResType<SuccessReady extends boolean = true, ErrorReady extends boolean = true> = SuccessReady extends true
  ? () => Respond<unknown, false, false>
  : ErrorReady extends true
  ? () => () => Respond<unknown, false, false>
  : never;

type CookieUserBase = { _id: string | unknown; verified: boolean };
type CookieUser<T> = T extends CookieUserBase ? { user?: CookieUserBase } : { user: CookieUserBase };

type CookieType<T = undefined> = EitherWithKeys<
  {
    template: "REFRESH" | "ACCESS" | "REFRESH_ACCESS";
  },
  {
    name: string;
    val: string;
    options: CookieOptions;
  }
> & { rememberMe?: boolean } & CookieUser<T>;

interface RespondOptions<T = undefined> {
  cookie: CookieType<T>;
  paginateMeta: { limit: number; offset: number };
  notif: string;
}

const defaultBody = <T>(): DataToResponse<T> => ({ data: {} as T, meta: { status: "ERROR" } });

/**
 * Wrapper for Express Response object with method chaining.
 * Provides utilities for standardized success/error responses and extra features.
 */
export class Respond<SuccessType = unknown, SuccessReady extends boolean = false, ErrorReady extends boolean = false> {
  private _jsonBody: DataToResponse<typeof this._body | typeof this._errorBody> = defaultBody();
  private _body?: SuccessType | SuccessType[];
  private _errorBody?: ErrorResponseType;
  private _accessToken?: string;
  private _refreshToken?: string;
  private _res: Response;
  private _rememberMe?: boolean;

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

  private reset() {
    this._body = undefined;
    this._errorBody = undefined;
    this._jsonBody = defaultBody();
    this._accessToken = undefined;
    this._refreshToken = undefined;
    return this as Respond<unknown, false>;
  }

  private finalize<S extends boolean>(success: S) {
    this._jsonBody.meta.status = success ? "SUCCESS" : "ERROR";
    this._jsonBody.data = success ? this._body : this._errorBody;
    return this as unknown as S extends true ? Respond<SuccessType, true> : Respond<ErrorResponseType, true>;
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
  body<T extends OneFieldOnly<{ success: SuccessType; error: ErrorResponseType }>>({ success, error }: T) {
    if (success) this._body = success;
    if (error) this._errorBody = error;
    return this as unknown as T extends { success: infer S }
      ? [S] extends [never]
        ? Respond<unknown, false, true>
        : Respond<S, true, false>
      : Respond<unknown, false, true>;
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
   *    .generateTokens({ user2, rememberMe: true })
   *    .sendCookie({ template: "REFRESH_ACCESS" });
   * ```
   *
   * @param cookie User data and options
   * @returns this
   */
  generateTokens(cookie: RespondOptions<SuccessType>["cookie"]) {
    let { user, rememberMe } = cookie;
    if (rememberMe !== undefined) this._rememberMe = rememberMe;
    if (!user) {
      if (!this._body) return this;
      user = this._body as unknown as CookieUserBase;
    }
    const { _id: userId, verified } = user as { _id: string; verified: boolean };
    this._accessToken = createAccessToken({ userId, verified, expires: new Date(Date.now() + fiveMin) });
    this._refreshToken = createRefreshToken(
      { userId, verified, expires: new Date(Date.now() + oneWeeks * 1.5) },
      this._rememberMe ? undefined : null
    );
    return this;
  }

  /**
   * Send cookies to the client (access, refresh, or custom).
   *
   * @example
   * ```ts
   * res.sendCookie({ template: "ACCESS", user, rememberMe: false });
   * res.body({ success: user }).sendCookie({ template: "ACCESS", rememberMe: false }).ok();
   * ```
   *
   * @param cookie Cookie configuration
   * @returns this
   */
  sendCookie(cookie: RespondOptions<SuccessType>["cookie"]) {
    const { name, options, rememberMe, template, val } = cookie;
    if (rememberMe !== undefined) this._rememberMe = rememberMe;
    if (!this._accessToken || !this._refreshToken) {
      if (!this._body && !cookie.user) return this;
      else if (template) this.generateTokens(cookie);
    }

    switch (template) {
      case "ACCESS":
        this._res.cookie("accessToken", this._accessToken, resAccessToken);
        break;
      case "REFRESH":
        this._res.cookie("refreshToken", this._refreshToken, this._rememberMe ? resRefreshToken : resRefreshTokenSessionOnly);
        break;
      case "REFRESH_ACCESS":
        this._res.cookie("accessToken", this._accessToken, resAccessToken);
        this._res.cookie("refreshToken", this._refreshToken, this._rememberMe ? resRefreshToken : resRefreshTokenSessionOnly);
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
   * res.body({ error: formattedError }).respond();
   * ```
   *
   * @returns this
   */
  respond: ResType<SuccessReady, ErrorReady> = (() => {
    this.finalize(true);
    if (this._body) {
      this.ok();
    } else if (this._errorBody) {
      this.error();
    }
    this.reset();
    return this as unknown as ResType<SuccessReady, false>;
  }) as any;

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
  ok: ResType<SuccessReady, false> = (() => {
    this.finalize(true);
    if (this._body) {
      this._res.status(200).json(this._jsonBody);
    }
    this.reset();
    return this;
  }) as any;

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
  noContent: ResType<SuccessReady, false> = (() => {
    this.finalize(true);
    this._res.status(204).json(this._jsonBody);
    this.reset();
    return this;
  }) as any;

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
  created: ResType<SuccessReady, false> = (() => {
    this.finalize(true);
    if (this._body) {
      this._res.status(201).json(this._jsonBody);
    }
    this.reset();
    return this;
  }) as any;

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
  error: ResType<false, ErrorReady> = (() => {
    this.finalize(false);
    const errorBody = this._errorBody;
    if (errorBody) {
      const status = errorBody.status ?? statusAlias.find((s) => s.code.includes(errorBody.code))?.status ?? 500;
      this._res.status(status).json(this._jsonBody);
    }
    this.reset();
    return this;
  }) as any;

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
    const body = this.body({ error: { ...restErr, title: "Missing Fields", message: `${fields.capital()} is required`, code: "MISSING_FIELDS" } });
    return body;
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
    const body = this.body({ error: { code: "CLIENT_FIELD", ...err } });
    return body;
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
   * @returns typeof .body({ error })
   */
  tempInvalidOTP(restErr?: Omit<RestError, "field">) {
    const body = this.body({
      error: {
        ...restErr,
        title: "Invalid OTP",
        message: "Invalid or expired OTP. Please request a new OTP code.",
        code: "CLIENT_FIELD",
        field: "otp",
      },
    });
    return body;
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
   * @returns typeof .body({ error })
   */
  tempInvalidAuth(restErr?: RestError) {
    const body = this.body({
      error: {
        ...restErr,
        title: "Authentication needed",
        message: "Authentication needed please back to dashboard or change your account",
        code: "INVALID_AUTH",
      },
    });
    return body;
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
   * @returns typeof .body({ error })
   */
  tempInvalidToken(restErr?: RestError) {
    const body = this.body({
      error: {
        ...restErr,
        title: "Invalid Session",
        message: "Invalid token please re-signin to refresh your session",
        code: "INVALID_TOKEN",
      },
    });
    return body;
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
   * @returns typeof .body({ error })
   */
  tempNotFound(item: string, desc?: string, restErr?: RestError) {
    const body = this.body({
      error: {
        ...restErr,
        title: "Not Found",
        message: `${item.capital()} not found${desc ? `. ${desc.capital()}` : ""}`,
        code: "NOT_FOUND",
      },
    });
    return body;
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
   * @returns typeof .body({ error })
   */
  tempIsBound = (provider?: string, restErr?: RestError) => {
    const body = this.body({
      error: { ...restErr, code: "IS_BOUND", message: `Account is already bound to ${provider ?? "local"}`, title: "Account already bounded" },
    });
    return body;
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
   * @returns typeof .body({ error })
   */
  tempNotBound(provider?: string, restErr?: RestError) {
    const body = this.body({
      error: {
        ...restErr,
        message: `Account is not bounded to ${provider ?? "local"} yet, please bind to ${provider ?? "local"} first`,
        code: "NOT_BOUND",
        title: "Account is not bounded",
      },
    });
    return body;
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
   * @returns typeof .body({ error })
   */
  tempTooMuchReq(desc?: string, restErr?: RestError) {
    const body = this.body({
      error: {
        ...restErr,
        title: "Too many requests",
        message: `Too many requests. ${desc?.capital() ?? "Please try again later"}`,
        code: "TOO_MUCH_REQUEST",
      },
    });
    return body;
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
   * @returns typeof .body({ error })
   */
  tempLimitSendEmail(restErr?: RestError) {
    const body = this.body({
      error: {
        ...restErr,
        title: "Too much request",
        message: "Too much request, please request to send mail again later",
        code: "TOO_MUCH_REQUEST",
      },
    });
    return body;
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
   * @returns typeof .body({ error })
   */
  tempIsVerified(restErr?: RestError) {
    const body = this.body({ error: { ...restErr, message: "Your email has been verified", code: "IS_VERIFIED", title: "You have been verified" } });
    return body;
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
   * @returns typeof .body({ error })
   */
  tempNotVerified(restErr?: RestError) {
    const body = this.body({
      error: {
        ...restErr,
        message: "Insufficient permissions, please verify your account",
        code: "NOT_VERIFIED",
        title: "Insufficient permissions",
      },
    });
    return body;
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
   * @returns typeof .body({ error })
   */
  tempSelfReq(restErr?: RestError) {
    const body = this.body({
      error: {
        ...restErr,
        message: "Can not self request, please report this issue to Hoshify Team",
        title: "Self request detected",
        code: "SELF_REQUEST",
      },
    });
    return body;
  }
}

/**
 * Extends Express Response with Respond features.
 */
export interface Respond extends Omit<Response, "res"> {}
