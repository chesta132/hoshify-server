import { pick } from "@/utils/manipulate/object";
import { ErrorResponseType, Respond, RestError } from "./Response";

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
