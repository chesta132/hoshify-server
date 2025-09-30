import { AppError } from "@/class/Error";
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

export const handlePrismaError = (err: unknown, modelName: string) => {
  const code = getErrorCode(err);

  switch (code) {
    case "P2025":
      throw new AppError("NOT_FOUND", { item: modelName });

    case "P2003":
      throw new AppError("NOT_FOUND", {
        item: "related record",
        desc: "Foreign key constraint failed",
        details: isPrismaError(err) ? err.message : undefined,
      });

    default:
      throw err;
  }
};
