import { Response } from "express";
import { ErrorRes } from "../class/Response";

export const resMissingFields = (res: Response, fields: string) => {
  ErrorRes({ title: "Missing Fields", message: `${fields.capital()} is required`, code: "MISSING_FIELDS" }).response(res);
};

export const resInvalidToken = (res: Response) => {
  ErrorRes({
    title: "Invalid Session",
    message: "Invalid token please re-signin to refresh your session",
    code: "INVALID_TOKEN",
  }).response(res);
};

export const resNotFound = (res: Response, item: string, desc?: string) => {
  ErrorRes({
    title: "Not Found",
    message: `${item.capital()} not found${desc ? `. ${desc.capital()}` : ""}`,
    code: "NOT_FOUND",
  }).response(res);
};

export const resIsBinded = (res: Response, provider?: string) => {
  ErrorRes({ code: "IS_BINDED", message: `Account is already binded to ${provider ?? "local"}`, title: "Account already binded" }).response(res);
};

export const resNotBinded = (res: Response, provider?: string) => {
  ErrorRes({
    message: `Account is not bind to ${provider ?? "local"} yet, please bind to ${provider ?? "local"} first`,
    code: "NOT_BINDED",
    title: "Account is not binded",
  }).response(res);
};

export const resInvalidOTP = (res: Response) => {
  ErrorRes({
    title: "Invalid OTP",
    message: "Invalid or expired OTP. Please request a new OTP code.",
    code: "CLIENT_FIELD",
    field: "otp",
  }).response(res);
};

export const resTooMuchRequest = (res: Response, desc?: string) => {
  ErrorRes({
    title: "Too many requests",
    message: `Too many requests. ${desc?.capital() ?? "Please try again later"}`,
    code: "TOO_MUCH_REQUEST",
  }).response(res);
};

export const resIsVerified = (res: Response) => {
  ErrorRes({ message: "Your email has been verified", code: "IS_VERIFIED", title: "You has been verified" }).response(res);
};

export const resNotVerified = (res: Response) => {
  ErrorRes({
    message: "Insufficient permissions, please verify you account",
    code: "NOT_VERIFIED",
    title: "Insufficient permissions",
  }).response(res);
};
