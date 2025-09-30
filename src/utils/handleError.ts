import { AppError, ServerError } from "@/class/Error";
import { Respond } from "@/class/Response";
import { Prisma } from "@prisma/client";
import { NextFunction, Response, Request } from "express";

/**
 * @deprecated Use NextFunction instead.
 */
export default function handleError(error: unknown, res: Response["res"]) {
  const err = error as Error | ServerError<any>;
  const createdError = new Error();
  const callerLine = createdError.stack?.split("\n")[2];

  console.error(`\n\n\nError found ${callerLine?.trim()}:\n`, err);
  if (err instanceof ServerError) {
    new ServerError(err.error, res).execute();
    return;
  } else if (err instanceof AppError) {
    new AppError(err, res).exec();
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

export const handleAppError = (err: unknown, req: Request, response: Response, next: NextFunction) => {
  const res = new Respond(req, response);

  if (err instanceof ServerError) {
    new ServerError(err.error, res).execute();
    return;
  } else if (err instanceof AppError) {
    new AppError(err, res).exec();
    return;
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    res
      .body({
        error: {
          message: err.message,
          title: "Validation Error",
          code: "SERVER_ERROR",
        },
      })
      .error();
    return;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res
        .body({
          error: {
            title: "Unique Constraint Error",
            message: `Unique constraint failed: ${err.meta?.constraint || "unknown field"}`,
            code: "SERVER_ERROR",
          },
        })
        .error();
      return;
    } else if (err.code === "P2025") {
      res
        .body({
          error: {
            title: "Record Not Found",
            message: "Required record not found. Please check your input.",
            code: "NOT_FOUND",
          },
        })
        .error();
      return;
    } else {
      res
        .body({
          error: {
            title: "Database Error",
            message: err.message,
            code: "SERVER_ERROR",
          },
        })
        .error();
      return;
    }
  } else {
    res.body({ error: { message: "Internal Server Error", code: "SERVER_ERROR", details: (err as Error).message } }).error();
  }
};
