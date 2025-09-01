import { ErrorResponseType, Respond, RestError } from "./Response";

export type ErrorTemplateConfig =
  | { code: "CLIENT_FIELD"; field: ErrorResponseType["field"]; message: string; restErr?: RestError }
  | { code: "MISSING_FIELDS"; field: string; restErr?: RestError }
  | { code: "CLIENT_TYPE"; field: string; details?: string; restErr?: RestError }
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

type SelectedConfig<C> = Extract<ErrorTemplateConfig, { code: C }>;
type ErrorProps<C> = Omit<SelectedConfig<C>, "code" | "restErr"> & SelectedConfig<C>["restErr"];

export class ErrorTemplate<C extends ErrorTemplateConfig["code"], T extends Respond | undefined = undefined> {
  error: ErrorTemplateConfig;
  private res?: T;

  constructor(code: C, props: ErrorProps<C>);
  constructor(error: ErrorTemplateConfig, res?: T);
  constructor(error: C | ErrorTemplateConfig, depedencies: (T | undefined) | ErrorProps<C>) {
    if (typeof error === "string") {
      const code = error;
      const dep = depedencies as ErrorProps<C>;
      const err = { code, ...dep, restErr: dep } as ErrorTemplateConfig;
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
        res.tempClientType(error.field, error.details, restErr).error();
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
        res.tempMissingFields(error.field, restErr).error();
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
