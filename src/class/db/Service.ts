import { Prisma } from "@prisma/client";
import { AppError } from "../Error";

type DefaultModelDelegate = {
  findFirstOrThrow: (...args: any) => any;
  findUniqueOrThrow: (...args: any) => any;
  findMany: (...args: any) => any;
  create: (...args: any) => any;
  update: (...args: any) => any;
  delete: (...args: any) => any;
};

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

type ArgsOf<F extends () => any> = Parameters<F>[0];
type ArgsOfById<F extends () => any> = Omit<ArgsOf<F>, "where">;

export abstract class BaseService<ModelDelegate extends DefaultModelDelegate, ModelName extends string> {
  private model: ModelDelegate;
  private modelName: ModelName;
  prisma: ModelDelegate;

  constructor(model: ModelDelegate, modelName: ModelName) {
    this.model = model;
    this.modelName = modelName;
    this.prisma = model;
  }

  private handleError(err: unknown): never {
    const code = getErrorCode(err);

    switch (code) {
      case "P2025":
        throw new AppError("NOT_FOUND", { item: this.modelName });

      case "P2003":
        throw new AppError("NOT_FOUND", {
          item: "related record",
          desc: "Foreign key constraint failed",
          details: isPrismaError(err) ? err.message : undefined,
        });

      default:
        throw err;
    }
  }

  async findFirst(args?: ArgsOf<ModelDelegate["findFirstOrThrow"]>) {
    try {
      return await this.model.findFirstOrThrow(args);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async findUnique(args: ArgsOf<ModelDelegate["findUniqueOrThrow"]>) {
    try {
      return await this.model.findUniqueOrThrow(args);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async findMany(args?: ArgsOf<ModelDelegate["findMany"]>) {
    try {
      return await this.model.findMany(args);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async create(args: ArgsOf<ModelDelegate["create"]>) {
    try {
      return await this.model.create(args);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async update(args: ArgsOf<ModelDelegate["update"]>) {
    try {
      return await this.model.update(args);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async delete(args: ArgsOf<ModelDelegate["delete"]>) {
    try {
      return await this.model.delete(args);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async findById(id: string, args?: ArgsOfById<ModelDelegate["findUniqueOrThrow"]>) {
    try {
      return await this.model.findUniqueOrThrow({ where: { id }, ...args });
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async findManyByIds(ids: string[], args?: ArgsOfById<ModelDelegate["findMany"]>) {
    try {
      return this.model.findMany({ where: { id: { in: ids } }, ...args });
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updateById(id: string, args: ArgsOfById<ModelDelegate["update"]>) {
    try {
      return this.model.update({ where: { id }, ...args });
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async deleteById(id: string, args?: ArgsOfById<ModelDelegate["delete"]>) {
    try {
      return await this.model.delete({
        where: { id },
        ...args,
      });
    } catch (err) {
      throw this.handleError(err);
    }
  }
}
