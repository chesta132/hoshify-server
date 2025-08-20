import { Response } from "express";
import { ErrorRes } from "../class/Response";

export default function handleError(error: unknown, res: Response) {
  const err = error as Error;
  const createdError = new Error();
  const callerLine = createdError.stack?.split("\n")[2];

  console.error(`\n\n\nError found ${callerLine?.trim()}:\n`, err);
  if (err && err.name === "ValidationError") {
    ErrorRes({
      message: err.message,
      title: "Validation Error",
      code: "SERVER_ERROR",
    }).response(res);
  } else if (err.name === "VersionError") {
    ErrorRes({
      title: "Version Error",
      message: "This item was modified by another user/process. Please refresh and try again",
      code: "SERVER_ERROR",
    }).response(res);
  } else ErrorRes({ message: "Internal Server Error", code: "SERVER_ERROR", details: err.message }).response(res);
}
