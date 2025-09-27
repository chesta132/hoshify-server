import { ServerError } from "@/class/ServerError";
import { Response } from "express";

export default function handleError(error: unknown, res: Response["res"]) {
  const err = error as Error | ServerError<any>;
  const createdError = new Error();
  const callerLine = createdError.stack?.split("\n")[2];

  console.error(`\n\n\nError found ${callerLine?.trim()}:\n`, err);
  if (err instanceof ServerError) {
    new ServerError(err.error, res).execute();
    return;
  } else if (err && err.name === "ValidationError") {
    res
      .body({
        error: {
          message: err.message,
          title: "Validation Error",
          code: "SERVER_ERROR",
        },
      })
      .error();
  } else if (err.name === "VersionError") {
    res
      .body({
        error: {
          title: "Version Error",
          message: "This item was modified by another user/process. Please refresh and try again",
          code: "SERVER_ERROR",
        },
      })
      .error();
  } else res.body({ error: { message: "Internal Server Error", code: "SERVER_ERROR", details: err.message } }).error();
}
