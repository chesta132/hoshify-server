import { Response } from "express";

export default function handleError(error: unknown, { res }: Response) {
  const err = error as Error;
  const createdError = new Error();
  const callerLine = createdError.stack?.split("\n")[2];

  console.error(`\n\n\nError found ${callerLine?.trim()}:\n`, err);
  if (err && err.name === "ValidationError") {
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
