import { ServiceError } from "@/services/db/types";
import { AppError } from "@/services/error/AppError";
import { Fields } from "@/types/client";
import { Prisma } from "@prisma/client";

type PrismaErrorCode = "P2025" | "P2002" | "P2021" | "P2022" | "P2000" | "P2001" | "P2004" | "P2014";

const isPrismaError = (err: unknown): err is Prisma.PrismaClientKnownRequestError => {
  return err instanceof Prisma.PrismaClientKnownRequestError;
};

const getErrorCode = (err: unknown): PrismaErrorCode | null => {
  if (isPrismaError(err)) {
    return err.code as PrismaErrorCode;
  }
  return null;
};

export const handleDBServiceError = (err: unknown, modelName: string, error?: ServiceError) => {
  const code = getErrorCode(err);
  if (error === null) return null;
  if (error instanceof AppError) return error;
  if (typeof error === "function") return error();

  switch (code) {
    case "P2025": // Record not found
      if (error?.notFound === null) return null;
      if (error?.notFound) return error.notFound;
      return new AppError("NOT_FOUND", { item: modelName });

    case "P2002": // Unique constraint failed
    case "P2021": // The record searched for in the where condition does not exist
    case "P2022": // A value that is required to be unique is missing
      if (error?.exists === null) return null;
      if (error?.exists) return error.exists;
      const target = isPrismaError(err) ? err.meta?.target : undefined;
      const field = Array.isArray(target) ? target[0] : "field";
      return new AppError("CLIENT_FIELD", {
        field: field as Fields,
        message: `${field} already exists`,
      });

    case "P2000": // Value too long
    case "P2001": // Record doesn't exist
    case "P2004": // Constraint failed
      return new AppError("CLIENT_TYPE", {
        fields: modelName,
        details: isPrismaError(err) ? err.message : undefined,
      });

    case "P2014": // Required relation violation
      return new AppError("MISSING_FIELDS", {
        fields: "required relation",
        details: isPrismaError(err) ? err.message : undefined,
      });

    default:
      return err;
  }
};
