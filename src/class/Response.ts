import { CodeError, EitherWithKeys, Fields, NormalizedData, OneFieldOnly } from "../types/types";
import { CookieOptions, Response, Request } from "express";
import {
  createAccessToken,
  createRefreshToken,
  fiveMin,
  oneWeeks,
  resAccessToken,
  resRefreshToken,
  resRefreshTokenSessionOnly,
} from "../utils/token";
import { USER_CRED, UserRole } from "@/models/User";
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "@/app";
import { normalizeCurrency, normalizeQuery, normalizeUserQuery } from "@/utils/manipulate/normalize";
import { capital } from "@/utils/manipulate/string";
import { currencyFields } from "@/utils/money";

/**
 * Authentication-related error codes.
 */
export const codeErrorAuth = ["INVALID_AUTH", "IS_BOUND", "NOT_BOUND", "INVALID_TOKEN", "INVALID_ROLE"] as const;

/**
 * Field validation-related error codes.
 */
export const codeErrorField = ["MISSING_FIELDS", "CLIENT_FIELD"] as const;

/**
 * Client-side related error codes.
 */
export const codeErrorClient = [
  "TOO_MUCH_REQUEST",
  "SELF_REQUEST",
  "CLIENT_REFRESH",
  "IS_VERIFIED",
  "NOT_VERIFIED",
  "INVALID_CLIENT_TYPE",
  "IS_RECYCLED",
  "NOT_RECYCLED",
] as const;

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

export interface RestError extends Omit<ErrorResponseType, "message" | "code"> {}

const statusAlias: {
  code: CodeError[];
  status: number;
}[] = [
  { code: ["INVALID_AUTH", "INVALID_TOKEN"], status: 401 },
  { code: ["IS_BOUND", "NOT_BOUND", "INVALID_ROLE", "NOT_VERIFIED"], status: 403 },
  { code: ["NOT_FOUND"], status: 404 },
  { code: ["CLIENT_FIELD", "MISSING_FIELDS", "SELF_REQUEST", "INVALID_CLIENT_TYPE"], status: 406 },
  { code: ["IS_VERIFIED", "IS_RECYCLED", "NOT_RECYCLED"], status: 409 },
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
    /** Optional information message */
    information?: string;
  };
  /** Response payload data */
  data: T;
}

type Responded = Respond<unknown, false, false>;

export type ResType<SuccessReady extends boolean, ErrorReady extends boolean> = IsTruthy<
  SuccessReady,
  () => Responded,
  IsTruthy<ErrorReady, () => Responded>
>;

type CookieUserBase = { id: string | unknown; verified: boolean; role: UserRole };
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
  private _body?: SuccessType | SuccessType[] | NormalizedData<SuccessType> | NormalizedData<SuccessType>[];
  private _errorBody?: ErrorResponseType;
  private _accessToken?: string;
  private _refreshToken?: string;
  private _res: Response;
  private _req: Request;
  private _rememberMe?: boolean;

  /**
   * Initialize Template of the original Response.
   * Uses Proxy to fallback to the underlying Express Response methods and properties.
   */
  constructor(req: Request, res: Response) {
    this._res = res;
    this._req = req;
  }

  private reset() {
    this._body = undefined;
    this._errorBody = undefined;
    this._jsonBody = defaultBody();
    this._accessToken = undefined;
    this._refreshToken = undefined;
    return this as Respond<unknown, false, false>;
  }

  private finalize<S extends boolean>(success: S) {
    if (success && typeof this._body === "object" && this._body !== null) {
      const body = this._body as Record<string, any> | any[];
      const checkCurrencyField = (body: any) => currencyFields.some((field) => typeof body[field] === "number");
      const checkUserCred = (body: any) => Object.keys(body).some((key) => USER_CRED.includes(key as (typeof USER_CRED)[number]));

      const hasId = Array.isArray(body) ? body.some((body) => body?._id) : body?._id;
      const isUserCred = Array.isArray(body) ? body.some((body) => checkUserCred(body)) : checkUserCred(body);
      const hasCurrencyField = Array.isArray(body) ? body.some((body) => checkCurrencyField(body)) : checkCurrencyField(body);
      type Normalizable = NormalizedData<SuccessType> | NormalizedData<SuccessType>[];

      if (isUserCred) {
        if (Array.isArray(body)) {
          this._body = body.map((body) => normalizeUserQuery(body)) as Normalizable;
        } else this._body = normalizeUserQuery(body) as Normalizable;
      } else if (hasCurrencyField && this._req.user) {
        if (Array.isArray(body)) {
          this._body = body.map((body) => normalizeCurrency(body, this._req.user!.currency)) as Normalizable;
        } else this._body = normalizeCurrency(body as any, this._req.user.currency);
      } else if (hasId) {
        this._body = normalizeQuery(body) as Normalizable;
      }
    }
    this._jsonBody.meta.status = success ? "SUCCESS" : "ERROR";
    this._jsonBody.data = success ? this._body : this._errorBody;
    return this as unknown as S extends true ? Respond<SuccessType, true, false> : Respond<unknown, false, true>;
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
   * Add a information message to the response metadata.
   *
   * @example
   * ```ts
   * res.info("Profile updated successfully")
   *    .body({ success: user })
   *    .ok();
   * ```
   *
   * @param information Information message
   * @returns this
   */
  info(information: string) {
    this._jsonBody.meta.information = information;
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
  paginate: IsTruthy<SuccessType extends any[] ? true : false, (paginateMeta: RespondOptions["paginateMeta"]) => this> = ((
    paginateMeta: RespondOptions["paginateMeta"]
  ) => {
    if (Array.isArray(this._body)) {
      const { limit, offset } = paginateMeta;
      const hasNext = this._body.length >= limit;
      const nextOffset = hasNext ? offset + limit : null;

      this._jsonBody.meta.hasNext = hasNext;
      this._jsonBody.meta.nextOffset = nextOffset;
    }
    return this;
  }) as any;

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
    let { id, verified, role } = user;
    this._accessToken = createAccessToken({
      userId: id as string,
      verified,
      expires: new Date(Date.now() + (Number(ACCESS_TOKEN_EXPIRY) || fiveMin)),
      role,
    });
    this._refreshToken = createRefreshToken(
      { userId: id as string, verified, expires: new Date(Date.now() + (Number(REFRESH_TOKEN_EXPIRY) || oneWeeks)), role },
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
   * Delete cookies from the response.
   *
   * @example
   * ```ts
   * res.body({ success: user }).deleteCookies(["accessToken", "refreshToken"]).ok();
   * ```
   *
   * @param name Name of the cookie or array of names to delete
   * @param options Cookie options
   * @returns this
   */
  deleteCookies(name: string[] | string, options?: CookieOptions) {
    if (Array.isArray(name)) {
      name.forEach((n) => this._res.clearCookie(n, options));
    } else {
      this._res.clearCookie(name, options);
    }
    return this;
  }

  /**
   * Redirect the client to a specified URL.
   * @example
   * ```ts
   * res.redirect("https://example.com");
   * ```
   *
   * @param url URL to redirect to
   * @returns this
   */
  redirect(url: string) {
    this._res.redirect(url);
    return this;
  }

  /**
   * Smart send success or error.
   *
   * @example
   * ```ts
   * res.info("User has been updated").body({ success: updatedUser }).respond();
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
   * res.info("Fetched user data").body({ success: user }).ok();
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
  noContent() {
    this.finalize(true);
    this._res.status(204).send();
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
      if (status >= 500) {
        console.error("\nServer error found and sent successfully:");
      } else {
        console.warn("\nClient error found and sent successfully:");
      }
      console.table(errorBody);
      this._res.status(status).json(this._jsonBody);
    }
    this.reset();
    return this;
  }) as any;

  tempMissingFields(fields: string, restErr?: RestError) {
    const body = this.body({ error: { ...restErr, title: "Missing Fields", message: `${capital(fields)} is required`, code: "MISSING_FIELDS" } });
    return body;
  }

  tempClientField(field: ErrorResponseType["field"], message: string, restErr?: RestError) {
    const body = this.body({ error: { ...restErr, field, message, code: "CLIENT_FIELD" } });
    return body;
  }

  tempClientType(field: string, details?: string, restErr?: RestError) {
    const body = this.body({
      error: {
        ...restErr,
        code: "INVALID_CLIENT_TYPE",
        message: `Invalid ${field} type. ${capital(details || "")}`.trim(),
        title: "Invalid Type",
      },
    });
    return body;
  }

  tempInvalidOTP(restErr?: Omit<RestError, "field">) {
    const body = this.body({
      error: {
        ...restErr,
        title: "Invalid OTP",
        message: "Invalid or expired OTP. Please request a new OTP code.",
        code: "CLIENT_FIELD",
        field: "token",
      },
    });
    return body;
  }

  tempInvalidVerifyToken(restErr?: Omit<RestError, "field">) {
    const body = this.body({
      error: {
        ...restErr,
        title: "Invalid OTP",
        message: "Invalid or expired Verification token. Please create a new verification email request.",
        code: "CLIENT_FIELD",
        field: "token",
      },
    });
    return body;
  }

  tempInvalidAuth(restErr?: RestError) {
    const body = this.body({
      error: {
        ...restErr,
        title: "Authentication Needed",
        message: "Authentication needed please back to dashboard or change your account",
        code: "INVALID_AUTH",
      },
    });
    return body;
  }

  tempInvalidRole(role: string, restErr?: RestError) {
    const body = this.body({
      error: { ...restErr, code: "INVALID_ROLE", message: `${capital(role.toLowerCase())} role needed`, title: "Invalid Role" },
    });
    return body;
  }

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

  tempNotFound(item: string, desc?: string, restErr?: RestError) {
    const body = this.body({
      error: {
        ...restErr,
        title: "Not Found",
        message: `${capital(item)} not found${desc ? `. ${capital(desc)}` : ""}`,
        code: "NOT_FOUND",
      },
    });
    return body;
  }

  tempIsBound = (provider?: string, restErr?: RestError) => {
    const body = this.body({
      error: { ...restErr, code: "IS_BOUND", message: `Account is already bound to ${provider ?? "local"}`, title: "Account already bounded" },
    });
    return body;
  };

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

  tempTooMuchReq(desc?: string, restErr?: RestError) {
    const body = this.body({
      error: {
        ...restErr,
        title: "Too many requests",
        message: `Too many requests. ${capital(desc || "") || "Please try again later"}`,
        code: "TOO_MUCH_REQUEST",
      },
    });
    return body;
  }

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

  tempIsVerified(restErr?: RestError) {
    const body = this.body({ error: { ...restErr, message: "Your email has been verified", code: "IS_VERIFIED", title: "You have been verified" } });
    return body;
  }

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

  tempIsRecycled(name: string, restErr?: RestError) {
    const body = this.body({
      error: {
        ...restErr,
        message: `${capital(name)} is recycled, please restore first`,
        code: "IS_RECYCLED",
      },
    });
    return body;
  }

  tempNotRecycled(name: string, restErr?: RestError) {
    const body = this.body({
      error: {
        ...restErr,
        message: `${capital(name)} is not recycled, please recycle first`,
        code: "NOT_RECYCLED",
      },
    });
    return body;
  }
}
