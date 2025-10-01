import { ServiceError } from "@/services/db/types";
import { AppError } from "@/services/error/Error";
import { Prisma } from "@prisma/client";

type PrismaErrorCode = "P2025" | "P2002" | "P2003" | "P2021" | "P2022";

const isPrismaError = (err: unknown): err is Prisma.PrismaClientKnownRequestError => {
  return err instanceof Prisma.PrismaClientKnownRequestError;
};

const getErrorCode = (err: unknown): PrismaErrorCode | null => {
  if (isPrismaError(err)) {
    return err.code as PrismaErrorCode;
  }
  return null;
};

export const handlePrismaError = (err: unknown, modelName: string, error?: ServiceError) => {
  const code = getErrorCode(err);

  switch (code) {
    case "P2025":
      if (error) return error;
      return new AppError("NOT_FOUND", { item: modelName });

    case "P2003":
      return new AppError("NOT_FOUND", {
        item: "related record",
        desc: "Foreign key constraint failed",
        details: isPrismaError(err) ? err.message : undefined,
      });

    default:
      return err;
  }
};
