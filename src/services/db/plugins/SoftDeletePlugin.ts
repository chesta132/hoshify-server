import { ArgsOf, DefaultModelDelegate, ModelNames, ServiceError, ServiceOptions, ServiceResult } from "@/services/db/types";
import { handlePrismaError } from "@/utils/db/handlePrismaError";
import { timeInMs } from "@/utils/manipulate/number";
import { ModelUser } from "../User";

const deleteTTL = timeInMs({ week: 2 });
export const getDeleteAt = () => new Date(Date.now() + deleteTTL);

export class SoftDeletePlugin<ModelDelegate extends DefaultModelDelegate, ModelName extends ModelNames> {
  private SDModel: ModelDelegate;
  private SDModelName: ModelName;

  constructor(model: ModelDelegate, modelName: ModelName) {
    this.SDModel = model;
    this.SDModelName = modelName;
  }

  async softDelete<E extends ServiceError>(
    args: Omit<ArgsOf<ModelDelegate["update"]>, "data">,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["update"], E>> {
    try {
      return await this.SDModel.update({ ...args, data: { deleteAt: getDeleteAt(), isRecycled: true } });
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.SDModelName, options?.error);
    }
  }

  async softDeleteById<E extends ServiceError>(
    id: string,
    args?: Omit<ArgsOf<ModelDelegate["update"]>, "data" | "where">,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["update"], E>> {
    try {
      return await this.SDModel.update({ ...args, data: { deleteAt: getDeleteAt(), isRecycled: true }, where: { id } });
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.SDModelName, options?.error);
    }
  }

  async softDeleteMany<E extends ServiceError>(
    args: Omit<ArgsOf<ModelDelegate["updateMany"]>, "data"> & ArgsOf<ModelDelegate["findMany"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["findMany"], E>> {
    try {
      await this.SDModel.updateMany({ ...args, data: { deleteAt: getDeleteAt(), isRecycled: true } });
      return await this.SDModel.findMany({ take: args.limit, ...args });
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.SDModelName, options?.error);
    }
  }

  async restore<E extends ServiceError>(
    args: Omit<ArgsOf<ModelDelegate["update"]>, "data">,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["update"], E>> {
    try {
      return await this.SDModel.update({ ...args, data: { deleteAt: null, isRecycled: false } });
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.SDModelName, options?.error);
    }
  }

  async restoreById<E extends ServiceError>(
    id: string,
    args?: Omit<ArgsOf<ModelDelegate["update"]>, "data" | "where">,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["update"], E>> {
    try {
      return await this.SDModel.update({ ...args, data: { deleteAt: null, isRecycled: false }, where: { id } });
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.SDModelName, options?.error);
    }
  }

  async restoreMany<E extends ServiceError>(
    args: Omit<ArgsOf<ModelDelegate["updateMany"]>, "data"> & ArgsOf<ModelDelegate["findMany"]>,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["findMany"], E>> {
    try {
      await this.SDModel.updateMany({ ...args, data: { deleteAt: null, isRecycled: false } });
      return await this.SDModel.findMany({ take: args.limit, ...args });
    } catch (err) {
      if (options?.error === null) {
        return null as any;
      }
      throw handlePrismaError(err, this.SDModelName, options?.error);
    }
  }
}
