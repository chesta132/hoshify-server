import { ErrorResponseType, Respond, RestError } from "./Response";

type TemplateErrors =
  | { code: "CLIENT_FIELD"; field: ErrorResponseType["field"]; message: string; restErr?: RestError }
  | { code: "MISSING_FIELDS"; fields: string; restErr?: RestError }
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

export class ErrorTemplate<T extends Respond | undefined = undefined> {
  error: TemplateErrors;
  private res?: T;
  constructor(error: TemplateErrors, res?: T) {
    this.error = error;
    this.res = res;
  }

  execute: IsTruthy<T, () => void> = (() => {
    const res = this.res!;
    const { error } = this;
    const { code, restErr } = error;
    switch (code) {
      case "CLIENT_FIELD":
        res.tempClientField(error.field, error.message, restErr).error();
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
