import { ArgsOf, DefaultModelDelegate, ModelNames, ServiceError, ServiceOptions, ServiceResult } from "@/services/db/types";
import { handleDBServiceError } from "@/utils/db/handleDBServiceError";
import { timeInMs } from "@/utils/manipulate/number";

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
      const handled = handleDBServiceError(err, this.SDModelName, options?.error);
      if (handled === null) return null as any;
      throw handled;
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
      const handled = handleDBServiceError(err, this.SDModelName, options?.error);
      if (handled === null) return null as any;
      throw handled;
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
      const handled = handleDBServiceError(err, this.SDModelName, options?.error);
      if (handled === null) return null as any;
      throw handled;
    }
  }

  async restore<E extends ServiceError>(
    args: Omit<ArgsOf<ModelDelegate["update"]>, "data">,
    options?: ServiceOptions<E>
  ): Promise<ServiceResult<ModelDelegate["update"], E>> {
    try {
      return await this.SDModel.update({ ...args, data: { deleteAt: null, isRecycled: false } });
    } catch (err) {
      const handled = handleDBServiceError(err, this.SDModelName, options?.error);
      if (handled === null) return null as any;
      throw handled;
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
      const handled = handleDBServiceError(err, this.SDModelName, options?.error);
      if (handled === null) return null as any;
      throw handled;
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
      const handled = handleDBServiceError(err, this.SDModelName, options?.error);
      if (handled === null) return null as any;
      throw handled;
    }
  }
}
