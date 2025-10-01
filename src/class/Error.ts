import { Respond, RestError } from "./Response";
import { Fields, RequireAtLeastOne } from "@/types";
import { capital } from "@/utils/manipulate/string";

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
  | { code: "NOT_RECYCLED"; deps: [err: { name: string } & RestError] }
  | { code: "SERVER_ERROR"; deps: [err: RequireAtLeastOne<{ error: Error; message: string }> & RestError] }
  | { code: "FORBIDDEN"; deps: [err: { message: string } & RestError] };

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
      case "SERVER_ERROR":
        res
          .body({
            error: { ...deps[0], message: deps[0].message || "Internal Server Error", code: "SERVER_ERROR", details: deps[0].error?.message },
          })
          .error();
        break;
      case "FORBIDDEN":
        res.body({ error: { ...deps[0], code: "SERVER_ERROR" } }).error();
        break;
    }
  }) as any;
}
