import { AppError } from "@/class/Error";
import { NODE_ENV } from "@/config";
import { OneFieldOnly } from "@/types";
import { DefaultModelDelegate, ModelNames, PromiseReturn } from "@/types/db";
import { handlePrismaError } from "@/utils/db/handlePrismaError";
import { randomDate, randomNumber, shortId } from "@/utils/random";

type CustomData<T> = T extends Date
  ? { dynamicDate: { start?: T; end?: T } }
  : T extends number
  ? { dynamicNumber: { min?: T; max?: T } }
  : T extends string
  ? { dynamicString: T }
  : {};
type DataDummy<M extends DefaultModelDelegate> = {
  [K in keyof M]: OneFieldOnly<{ fixed: M[K]; enum: M[K][] } & CustomData<M[K]>>;
};

export class DummyPlugin<ModelDelegate extends DefaultModelDelegate, ModelName extends ModelNames> {
  private DModel: ModelDelegate;
  private DModelName: ModelName;

  constructor(model: ModelDelegate, modelName: ModelName) {
    this.DModel = model;
    this.DModelName = modelName;
  }

  async createDummy(length: number, data: DataDummy<ModelDelegate>): Promise<PromiseReturn<ModelDelegate["createMany"]>> {
    try {
      if (NODE_ENV !== "development") throw new AppError("FORBIDDEN", { message: "Can not create dummy data right now." });

      const dummys = Array.from(new Array(length)).map((_, idx) => {
        const customized: [string, any][] = [];
        for (const [doc, val] of Object.entries(data)) {
          if (val?.fixed) {
            customized.push([doc, val.fixed]);
          } else if (val?.dynamicString) {
            const dynamiced = `${val.dynamicString}_${idx + 1}_${shortId()}`;
            customized.push([doc, dynamiced]);
          } else if (val?.dynamicNumber) {
            const { max = 1000, min = 0 } = val.dynamicNumber;
            const rand = randomNumber(min, max);
            customized.push([doc, rand]);
          } else if (val?.dynamicDate) {
            const { start = new Date(0), end = new Date() } = val.dynamicDate;
            const rand = randomDate(start, end);
            customized.push([doc, rand]);
          } else if (val?.enum) {
            const rand = randomNumber(0, val.enum.length - 1);
            const choosen = val.enum[rand];
            customized.push([doc, choosen]);
          }
        }
        return { ...Object.fromEntries(customized), dummy: true };
      });

      return await this.DModel.create({ data: dummys });
    } catch (err) {
      throw handlePrismaError(err, this.DModelName);
    }
  }

  async deleteDummy(length: number): Promise<PromiseReturn<ModelDelegate["deleteMany"]>> {
    try {
      if (NODE_ENV !== "development") throw new AppError("FORBIDDEN", { message: "Can not delete dummy data right now." });
      return await this.DModel.deleteMany({ where: { dummy: true }, limit: length });
    } catch (err) {
      throw handlePrismaError(err, this.DModelName);
    }
  }
}
