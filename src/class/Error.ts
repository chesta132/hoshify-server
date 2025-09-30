import { pick } from "@/utils/manipulate/object";
import { ErrorResponseType, Respond, RestError } from "./Response";
import { Fields } from "@/types";
import { capital } from "@/utils/manipulate/string";

export type ServerErrorConfig =
  | { code: "CLIENT_FIELD"; field: ErrorResponseType["field"]; message: string; restErr?: RestError }
  | { code: "MISSING_FIELDS"; fields: string; restErr?: RestError }
  | { code: "CLIENT_TYPE"; fields: string; details?: string; restErr?: RestError }
  | { code: "INVALID_OTP"; restErr?: Omit<RestError, "field"> }
  | { code: "INVALID_VERIF_TOKEN"; restErr?: Omit<RestError, "field"> }
  | { code: "INVALID_AUTH"; restErr?: RestError }
  | { code: "INVALID_ROLE"; role: string; restErr?: RestError }
  | { code: "INVALID_TOKEN"; restErr?: RestError }
  | { code: "NOT_FOUND"; item: string; desc?: string; restErr?: RestError }
  | { code: "IS_BOUND"; provider?: string; restErr?: RestError }
  | { code: "NOT_BOUND"; provider?: string; restErr?: RestError }
  | { code: "TOO_MUCH_REQ"; desc?: string; restErr?: RestError }
  | { code: "EMAIL_LIMIT"; restErr?: RestError }
  | { code: "IS_VERIFIED"; restErr?: RestError }
  | { code: "NOT_VERIFIED"; restErr?: RestError }
  | { code: "SELF_REQ"; restErr?: RestError }
  | { code: "IS_RECYCLED"; name: string; restErr?: RestError }
  | { code: "NOT_RECYCLED"; name: string; restErr?: RestError };

type OptionalCodes =
  | "SELF_REQ"
  | "INVALID_OTP"
  | "INVALID_VERIF_TOKEN"
  | "INVALID_AUTH"
  | "INVALID_TOKEN"
  | "IS_BOUND"
  | "NOT_BOUND"
  | "TOO_MUCH_REQ"
  | "EMAIL_LIMIT"
  | "IS_VERIFIED"
  | "NOT_VERIFIED";

type SelectedConfig<C> = Extract<ServerErrorConfig, { code: C }>;
type Depedencies<C> = Omit<SelectedConfig<C>, "code" | "restErr">;
type SelectedRestErr<C> = Pick<SelectedConfig<C>, "restErr">;
type ErrorProps<C> = Depedencies<C> & SelectedRestErr<C>;
type ExtractOptional<C> = Extract<C, OptionalCodes>;

/**
 * @deprecated Use AppError for more typesafe.
 */
export class ServerError<C extends ServerErrorConfig["code"], T extends Respond | undefined = undefined> {
  error: ServerErrorConfig;
  private res?: T;

  constructor(code: ExtractOptional<C>, depedencies?: Depedencies<C>, restErr?: SelectedRestErr<C>["restErr"]);
  constructor(code: ExtractOptional<C>, depedencies?: ErrorProps<C>);
  constructor(code: C, depedencies: Depedencies<C>, restErr?: SelectedRestErr<C>["restErr"]);
  constructor(code: C, depedencies: ErrorProps<C>);

  constructor(error: ServerErrorConfig, res?: T);

  constructor(
    error: C | ExtractOptional<C> | ServerErrorConfig,
    depedencies: (T | undefined) | ErrorProps<C> | Depedencies<C>,
    restErr?: SelectedRestErr<C>["restErr"]
  ) {
    if (typeof error === "string") {
      const code = error;
      const dep = depedencies as ErrorProps<C> | Depedencies<C> | undefined;
      const err = { code, ...dep } as ServerErrorConfig;
      if (!err.restErr) {
        if (restErr) {
          err.restErr = restErr as RestError;
        } else if (dep) {
          err.restErr = pick(dep as RestError, ["title", "details", "field", "status"]);
        }
      }
      this.error = err;
    } else {
      this.error = error;
      this.res = depedencies as T | undefined;
    }
  }

  execute: IsTruthy<T, () => void> = (() => {
    const { error, res } = this;
    const { code, restErr } = error;
    if (!res) return;

    switch (code) {
      case "CLIENT_FIELD":
        res.tempClientField(error.field, error.message).error();
        return;
      case "EMAIL_LIMIT":
        res.tempLimitSendEmail(restErr).error();
        return;
      case "CLIENT_TYPE":
        res.tempClientType(error.fields, error.details, restErr).error();
        return;
      case "INVALID_AUTH":
        res.tempInvalidAuth(restErr).error();
        return;
      case "INVALID_OTP":
        res.tempInvalidOTP(restErr).error();
        return;
      case "INVALID_ROLE":
        res.tempInvalidRole(error.role, restErr).error();
        return;
      case "INVALID_TOKEN":
        res.tempInvalidToken(restErr).error();
        return;
      case "INVALID_VERIF_TOKEN":
        res.tempInvalidVerifyToken(restErr).error();
        return;
      case "IS_BOUND":
        res.tempIsBound(error.provider, restErr).error();
        return;
      case "NOT_BOUND":
        res.tempNotBound(error.provider, restErr).error();
        return;
      case "IS_RECYCLED":
        res.tempIsRecycled(error.name, restErr).error();
        return;
      case "IS_VERIFIED":
        res.tempIsVerified(restErr).error();
        return;
      case "MISSING_FIELDS":
        res.tempMissingFields(error.fields, restErr).error();
        return;
      case "NOT_FOUND":
        res.tempNotFound(error.item, error.desc, restErr).error();
        return;
      case "NOT_RECYCLED":
        res.tempNotRecycled(error.name, restErr).error();
        return;
      case "NOT_VERIFIED":
        res.tempNotVerified(restErr).error();
        return;
      case "SELF_REQ":
        res.tempSelfReq(restErr).error();
        return;
      case "TOO_MUCH_REQ":
        res.tempTooMuchReq(error.desc, restErr).error();
        return;
    }
  }) as any;
}

export type AppErrorConfig =
  | { code: "CLIENT_FIELD"; deps: [err: { field: Fields; message: string } & RestError] }
  | { code: "MISSING_FIELDS"; deps: [err: { fields: string } & RestError] }
  | { code: "CLIENT_TYPE"; deps: [err: { fields: string; details?: string } & RestError] }
  | { code: "INVALID_OTP"; deps: [err?: Omit<RestError, "field">] }
  | { code: "INVALID_AUTH"; deps: [err?: RestError] }
  | { code: "INVALID_VERIF_TOKEN"; deps: [err?: Omit<RestError, "field">] }
  | { code: "INVALID_ROLE"; deps: [err: { role: string } & RestError] }
  | { code: "INVALID_TOKEN"; deps: [err?: RestError] }
  | { code: "NOT_FOUND"; deps: [err: { item: string; desc?: string } & RestError] }
  | { code: "IS_BOUND"; deps: [err?: { provider?: string } & RestError] }
  | { code: "NOT_BOUND"; deps: [err?: { provider?: string } & RestError] }
  | { code: "TOO_MUCH_REQ"; deps: [err?: { desc?: string } & RestError] }
  | { code: "EMAIL_LIMIT"; deps: [err?: RestError] }
  | { code: "IS_VERIFIED"; deps: [err?: RestError] }
  | { code: "NOT_VERIFIED"; deps: [err?: RestError] }
  | { code: "SELF_REQ"; deps: [err?: RestError] }
  | { code: "IS_RECYCLED"; deps: [err: { name: string } & RestError] }
  | { code: "NOT_RECYCLED"; deps: [err: { name: string } & RestError] };

export type AppErrorCode = AppErrorConfig["code"];
type Config<C> = Extract<AppErrorConfig, { code: C }>;
type DepsOf<C extends AppErrorCode> = Config<C>["deps"];

export class AppError<C extends AppErrorCode, R extends Respond | undefined = undefined> {
  code: C;
  deps: DepsOf<C>;
  private res?: R;

  constructor(code: C, ...deps: DepsOf<C>);
  constructor(error: AppError<C>, res: R);

  constructor(codeOrError: C | AppError<C>, ...depsOrRes: DepsOf<C> | [R]) {
    if (codeOrError instanceof AppError) {
      this.code = codeOrError.code;
      this.deps = codeOrError.deps;
    } else {
      this.code = codeOrError;
      this.deps = depsOrRes as unknown as DepsOf<C>;
    }
  }

  exec: R extends undefined ? never : () => void = (() => {
    const { res } = this;
    if (!res) throw new Error("res not inserted");
    const { deps, code } = { code: this.code, deps: this.deps } as AppErrorConfig;

    switch (code) {
      case "CLIENT_FIELD":
        res.body({ error: { ...deps[0], field: deps[0].field, message: deps[0].message, code: "CLIENT_FIELD" } }).error();
        break;
      case "MISSING_FIELDS":
        res
          .body({ error: { ...deps[0], title: "Missing Fields", message: `${capital(deps[0].fields)} is required`, code: "MISSING_FIELDS" } })
          .error();
        break;
      case "CLIENT_TYPE":
        res
          .body({
            error: {
              ...deps[0],
              code: "INVALID_CLIENT_TYPE",
              message: `Invalid ${deps[0].fields} type. ${capital(deps[0].details || "")}`.trim(),
              title: "Invalid Type",
            },
          })
          .error();
        break;
      case "INVALID_OTP":
        res
          .body({
            error: {
              ...deps[0],
              title: "Invalid OTP",
              message: "Invalid or expired OTP. Please request a new OTP code.",
              code: "CLIENT_FIELD",
              field: "token",
            },
          })
          .error();
        break;
      case "INVALID_VERIF_TOKEN":
        res
          .body({
            error: {
              ...deps[0],
              title: "Invalid OTP",
              message: "Invalid or expired Verification token. Please create a new verification email request.",
              code: "CLIENT_FIELD",
              field: "token",
            },
          })
          .error();
        break;
      case "INVALID_AUTH":
        res
          .body({
            error: {
              ...deps[0],
              title: "Authentication Needed",
              message: "Authentication needed please back to dashboard or change your account",
              code: "INVALID_AUTH",
            },
          })
          .error();
        break;
      case "INVALID_ROLE":
        res
          .body({
            error: { ...deps[0], code: "INVALID_ROLE", message: `${capital(deps[0].role.toLowerCase())} role needed`, title: "Invalid Role" },
          })
          .error();
        break;
      case "INVALID_TOKEN":
        res
          .body({
            error: {
              ...deps[0],
              title: "Invalid Session",
              message: "Invalid token please re-signin to refresh your session",
              code: "INVALID_TOKEN",
            },
          })
          .error();
        break;
      case "NOT_FOUND":
        res
          .body({
            error: {
              ...deps[0],
              title: "Not Found",
              message: `${capital(deps[0].item)} not found${deps[0].desc ? `. ${capital(deps[0].desc)}` : ""}`,
              code: "NOT_FOUND",
            },
          })
          .error();
        break;
      case "IS_BOUND":
        res
          .body({
            error: {
              ...deps[0],
              code: "IS_BOUND",
              message: `Account is already bound to ${deps[0]?.provider ?? "local"}`,
              title: "Account already bounded",
            },
          })
          .error();
        break;
      case "NOT_BOUND":
        res
          .body({
            error: {
              ...deps[0],
              message: `Account is not bounded to ${deps[0]?.provider ?? "local"} yet, please bind to ${deps[0]?.provider ?? "local"} first`,
              code: "NOT_BOUND",
              title: "Account is not bounded",
            },
          })
          .error();
        break;
      case "TOO_MUCH_REQ":
        res
          .body({
            error: {
              ...deps[0],
              title: "Too many requests",
              message: `Too many requests. ${capital(deps[0]?.desc || "") || "Please try again later"}`,
              code: "TOO_MUCH_REQUEST",
            },
          })
          .error();
        break;
      case "EMAIL_LIMIT":
        res
          .body({
            error: {
              ...deps[0],
              title: "Too much request",
              message: "Too much request, please request to send mail again later",
              code: "TOO_MUCH_REQUEST",
            },
          })
          .error();
        break;
      case "IS_VERIFIED":
        res.body({ error: { ...deps[0], message: "Your email has been verified", code: "IS_VERIFIED", title: "You have been verified" } }).error();
        break;
      case "NOT_VERIFIED":
        res
          .body({
            error: {
              ...deps[0],
              message: "Insufficient permissions, please verify your account",
              code: "NOT_VERIFIED",
              title: "Insufficient permissions",
            },
          })
          .error();
        break;
      case "SELF_REQ":
        res
          .body({
            error: {
              ...deps[0],
              message: "Can not self request, please report this issue to Hoshify Team",
              title: "Self request detected",
              code: "SELF_REQUEST",
            },
          })
          .error();
        break;
      case "IS_RECYCLED":
        res
          .body({
            error: {
              ...deps[0],
              message: `${capital(deps[0].name)} is recycled, please restore first`,
              code: "IS_RECYCLED",
            },
          })
          .error();
        break;
      case "NOT_RECYCLED":
        res
          .body({
            error: {
              ...deps[0],
              message: `${capital(deps[0].name)} is not recycled, please recycle first`,
              code: "NOT_RECYCLED",
            },
          })
          .error();
        break;
    }
  }) as any;
}
