import { AppError } from "@/class/Error";
import { Respond } from "@/class/Response";
import { Prisma } from "@prisma/client";
import { NextFunction, Response, Request } from "express";

export const handleError = (err: unknown, req: Request, response: Response, next: NextFunction) => {
  const res = new Respond(req, response);
  if (err instanceof AppError) {
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
