import { ArgsOf, ArgsOfById, DefaultModelDelegate, ModelNames, PromiseReturn } from "@/types/db";
import { handlePrismaError } from "@/utils/db/handlePrismaError";

export abstract class BaseService<ModelDelegate extends DefaultModelDelegate, ModelName extends ModelNames> {
  private model: ModelDelegate;
  private modelName: ModelName;
  prisma: ModelDelegate;

  constructor(model: ModelDelegate, modelName: ModelName) {
    this.model = model;
    this.modelName = modelName;
    this.prisma = model;
  }

  async findFirst(args?: ArgsOf<ModelDelegate["findFirstOrThrow"]>): Promise<PromiseReturn<ModelDelegate["findFirstOrThrow"]>> {
    try {
      return await this.model.findFirstOrThrow(args);
    } catch (err) {
      throw handlePrismaError(err, this.modelName);
    }
  }

  async findUnique(args: ArgsOf<ModelDelegate["findUniqueOrThrow"]>): Promise<PromiseReturn<ModelDelegate["findUniqueOrThrow"]>> {
    try {
      return await this.model.findUniqueOrThrow(args);
    } catch (err) {
      throw handlePrismaError(err, this.modelName);
    }
  }

  async findMany(args?: ArgsOf<ModelDelegate["findMany"]>): Promise<PromiseReturn<ModelDelegate["findMany"]>> {
    try {
      return await this.model.findMany(args);
    } catch (err) {
      throw handlePrismaError(err, this.modelName);
    }
  }

  async create(args: ArgsOf<ModelDelegate["create"]>): Promise<PromiseReturn<ModelDelegate["create"]>>;
  async create(args: ArgsOf<ModelDelegate["createMany"]>): Promise<PromiseReturn<ModelDelegate["createMany"]>>;
  async create(args: any): Promise<any> {
    try {
      if (Array.isArray(args.data)) {
        return await this.model.createMany(args);
      } else {
        return await this.model.create(args);
      }
    } catch (err) {
      throw handlePrismaError(err, this.modelName);
    }
  }

  async update(args: ArgsOf<ModelDelegate["update"]>): Promise<PromiseReturn<ModelDelegate["update"]>>;
  async update(args: ArgsOf<ModelDelegate["updateMany"]>): Promise<PromiseReturn<ModelDelegate["updateMany"]>>;
  async update(args: ArgsOf<ModelDelegate["update"]>): Promise<PromiseReturn<ModelDelegate["update"]>> {
    try {
      if (Array.isArray(args.data)) {
        return await this.model.updateMany(args);
      } else {
        return await this.model.update(args);
      }
    } catch (err) {
      throw handlePrismaError(err, this.modelName);
    }
  }

  async delete(args: ArgsOf<ModelDelegate["delete"]>): Promise<PromiseReturn<ModelDelegate["delete"]>> {
    try {
      return await this.model.delete(args);
    } catch (err) {
      throw handlePrismaError(err, this.modelName);
    }
  }

  async deleteMany(args: ArgsOf<ModelDelegate["deleteMany"]>): Promise<PromiseReturn<ModelDelegate["deleteMany"]>> {
    try {
      return await this.model.deleteMany(args);
    } catch (err) {
      throw handlePrismaError(err, this.modelName);
    }
  }

  async findById(id: string, args?: ArgsOfById<ModelDelegate["findUniqueOrThrow"]>): Promise<PromiseReturn<ModelDelegate["findUniqueOrThrow"]>> {
    try {
      return await this.model.findUniqueOrThrow({ where: { id }, ...args });
    } catch (err) {
      throw handlePrismaError(err, this.modelName);
    }
  }

  async findManyByIds(ids: string[], args?: ArgsOfById<ModelDelegate["findMany"]>): Promise<PromiseReturn<ModelDelegate["findMany"]>> {
    try {
      return this.model.findMany({ where: { id: { in: ids } }, ...args });
    } catch (err) {
      throw handlePrismaError(err, this.modelName);
    }
  }

  async updateById(id: string, args: ArgsOfById<ModelDelegate["update"]>): Promise<PromiseReturn<ModelDelegate["update"]>> {
    try {
      return this.model.update({ where: { id }, ...args });
    } catch (err) {
      throw handlePrismaError(err, this.modelName);
    }
  }

  async deleteById(id: string, args?: ArgsOfById<ModelDelegate["delete"]>): Promise<PromiseReturn<ModelDelegate["delete"]>> {
    try {
      return await this.model.delete({
        where: { id },
        ...args,
      });
    } catch (err) {
      throw handlePrismaError(err, this.modelName);
    }
  }
}
