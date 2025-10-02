import { ArgsOf, ArgsOfById, DefaultModelDelegate, ModelNames, ServiceError, ServiceOptions, ServiceResult } from "@/services/db/types";
import { handlePrismaError } from "@/utils/db/handlePrismaError";
import { prisma } from ".";

export abstract class BaseService<ModelDelegate extends DefaultModelDelegate, ModelName extends ModelNames> {
  private model: ModelDelegate;
  modelName: ModelName;
  prisma: ModelDelegate;

  constructor(model: ModelDelegate, modelName: ModelName) {
    this.model = model;
    this.modelName = modelName;
    this.prisma = model;
  }

  async findFirst<E extends ServiceError>(
    args?: ArgsOf<ModelDelegate["findFirstOrThrow"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["findFirstOrThrow"], E>> {
    try {
      return await this.model.findFirstOrThrow(args);
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.modelName, options?.error);
    }
  }

  async findUnique<E extends ServiceError>(
    args: ArgsOf<ModelDelegate["findUniqueOrThrow"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["findUniqueOrThrow"], E>> {
    try {
      return await this.model.findUniqueOrThrow(args);
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.modelName, options?.error);
    }
  }

  async findMany<E extends ServiceError>(
    args?: ArgsOf<ModelDelegate["findMany"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["findMany"], E>> {
    try {
      return await this.model.findMany(args);
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.modelName, options?.error);
    }
  }

  async create<E extends ServiceError>(
    args: ArgsOf<ModelDelegate["create"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["create"], E>>;
  async create<E extends ServiceError>(
    args: ArgsOf<ModelDelegate["createMany"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["createMany"], E>>;
  async create<E extends ServiceError>(args: any, options?: ServiceOptions<E>): Promise<any> {
    try {
      if (Array.isArray(args.data)) {
        return await this.model.createMany(args);
      } else {
        return await this.model.create(args);
      }
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.modelName, options?.error);
    }
  }

  async createManyAndReturn<E extends ServiceError>(
    args: ArgsOf<ModelDelegate["createManyAndReturn"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["createManyAndReturn"], E>> {
    try {
      return await this.model.createManyAndReturn(args);
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.modelName, options?.error);
    }
  }

  async update<E extends ServiceError>(
    args: ArgsOf<ModelDelegate["update"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["update"], E>>;
  async update<E extends ServiceError>(
    args: ArgsOf<ModelDelegate["updateMany"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["updateMany"], E>>;
  async update<E extends ServiceError>(
    args: ArgsOf<ModelDelegate["update"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["update"], E>> {
    try {
      if (Array.isArray(args.data)) {
        return await this.model.updateMany(args);
      } else {
        return await this.model.update(args);
      }
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.modelName, options?.error);
    }
  }

  async updateManyAndReturn<E extends ServiceError>(
    args: ArgsOf<ModelDelegate["findMany"]> & ArgsOf<ModelDelegate["updateMany"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["findMany"], E>> {
    try {
      await this.model.updateMany({ ...args });
      return await this.model.findMany({ take: args.limit, ...args });
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.modelName, options?.error);
    }
  }

  async delete<E extends ServiceError>(
    args: ArgsOf<ModelDelegate["delete"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["delete"], E>> {
    try {
      return await this.model.delete(args);
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.modelName, options?.error);
    }
  }

  async deleteMany<E extends ServiceError>(
    args: ArgsOf<ModelDelegate["deleteMany"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["deleteMany"], E>> {
    try {
      return await this.model.deleteMany(args);
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.modelName, options?.error);
    }
  }

  async findById<E extends ServiceError>(
    id: string,
    args?: ArgsOfById<ModelDelegate["findUniqueOrThrow"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["findUniqueOrThrow"], E>> {
    try {
      return await this.model.findUniqueOrThrow({ where: { id }, ...args });
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.modelName, options?.error);
    }
  }

  async findManyByIds<E extends ServiceError>(
    ids: string[],
    args?: ArgsOfById<ModelDelegate["findMany"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["findMany"], E>> {
    try {
      return this.model.findMany({ where: { id: { in: ids } }, ...args });
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.modelName, options?.error);
    }
  }

  async updateById<E extends ServiceError>(
    id: string,
    args: ArgsOfById<ModelDelegate["update"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["update"], E>> {
    try {
      return this.model.update({ where: { id }, ...args });
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.modelName, options?.error);
    }
  }

  async deleteById<E extends ServiceError>(
    id: string,
    args?: ArgsOfById<ModelDelegate["delete"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["delete"], E>> {
    try {
      return await this.model.delete({
        where: { id },
        ...args,
      });
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.modelName, options?.error);
    }
  }
}

export const unEditableField = ["userId", "id", "deleteAt", "isRecycled", "dummy"];
