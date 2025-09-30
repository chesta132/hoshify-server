import { ArgsOf, DefaultModelDelegate, PromiseReturn } from "@/types/db";
import { handlePrismaError } from "@/utils/db/handlePrismaError";
import { timeInMs } from "@/utils/manipulate/number";

const deleteTTL = timeInMs({ week: 2 });
const getDeleteAt = () => new Date(Date.now() + deleteTTL);

export class SoftDeletePlugin<ModelDelegate extends DefaultModelDelegate, ModelName extends string> {
  private SDModel: ModelDelegate;
  private SDModelName: ModelName;

  constructor(model: ModelDelegate, modelName: ModelName) {
    this.SDModel = model;
    this.SDModelName = modelName;
  }

  async softDelete(args: Omit<ArgsOf<ModelDelegate["update"]>, "data">): Promise<PromiseReturn<ModelDelegate["update"]>> {
    try {
      return await this.SDModel.update({ ...args, data: { deleteAt: getDeleteAt(), isRecycled: true } });
    } catch (err) {
      throw handlePrismaError(err, this.SDModelName);
    }
  }

  async softDeleteById(id: string, args?: Omit<ArgsOf<ModelDelegate["update"]>, "data" | "where">): Promise<PromiseReturn<ModelDelegate["update"]>> {
    try {
      return await this.SDModel.update({ ...args, data: { deleteAt: getDeleteAt(), isRecycled: true }, where: { id } });
    } catch (err) {
      throw handlePrismaError(err, this.SDModelName);
    }
  }

  async restore(args: Omit<ArgsOf<ModelDelegate["update"]>, "data">): Promise<PromiseReturn<ModelDelegate["update"]>> {
    try {
      return await this.SDModel.update({ ...args, data: { deleteAt: null, isRecycled: false } });
    } catch (err) {
      throw handlePrismaError(err, this.SDModelName);
    }
  }

  async restoreById(id: string, args?: Omit<ArgsOf<ModelDelegate["update"]>, "data" | "where">): Promise<PromiseReturn<ModelDelegate["update"]>> {
    try {
      return await this.SDModel.update({ ...args, data: { deleteAt: null, isRecycled: false }, where: { id } });
    } catch (err) {
      throw handlePrismaError(err, this.SDModelName);
    }
  }
}
