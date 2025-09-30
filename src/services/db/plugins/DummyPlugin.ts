import { AppError } from "@/class/Error";
import { NODE_ENV } from "@/config";
import { OneFieldOnly } from "@/types";
import { DefaultModelDelegate, InferByDelegate, ModelNames, PromiseReturn } from "@/types/db";
import { handlePrismaError } from "@/utils/db/handlePrismaError";
import { timeInMs } from "@/utils/manipulate/number";
import { randomDate, randomNumber, shortId } from "@/utils/random";

type CustomData<T> = Date extends T
  ? { dynamicDate: { start?: Date; end?: Date } }
  : T extends number
  ? { dynamicNumber: { min?: T; max?: T } }
  : T extends string
  ? { dynamicString: T; timestamp: boolean }
  : never;
type DataDummy<M extends DefaultModelDelegate> = {
  [K in keyof M]: OneFieldOnly<{ fixed: M[K]; enum: M[K][] } & CustomData<M[K]>>;
};

export class DummyPlugin<ModelDelegate extends DefaultModelDelegate, ModelName extends ModelNames> {
  private DModel: ModelDelegate;
  private DModelName: ModelName;
  private seed: DataDummy<ModelDelegate>;

  constructor(model: ModelDelegate, modelName: ModelName, seed: DataDummy<InferByDelegate<ModelDelegate>>) {
    this.DModel = model;
    this.DModelName = modelName;
    this.seed = seed;
  }

  async createDummy(
    userId: string,
    {
      seed,
      length = 30,
    }: {
      length?: number;
      seed?: Partial<DataDummy<InferByDelegate<ModelDelegate>>>;
    } = {}
  ): Promise<PromiseReturn<ModelDelegate["createMany"]>> {
    try {
      if (NODE_ENV !== "development") throw new AppError("FORBIDDEN", { message: "Can not create dummy data right now." });
      const seeds = { ...this.seed, ...seed } as DataDummy<ModelDelegate>;

      const dummys = Array.from(new Array(length)).map((_, idx) => {
        const customized: Record<string, any> = {};

        for (const [doc, val] of Object.entries(seeds)) {
          if (val?.fixed !== undefined) {
            customized[doc] = val.fixed;
          } else if (val?.dynamicString) {
            customized[doc] = `${val.dynamicString}_${idx + 1}_${shortId()}`;
          } else if (val?.dynamicNumber) {
            const { max = 1000, min = 0 } = val.dynamicNumber;
            customized[doc] = randomNumber(min, max);
          } else if (val?.dynamicDate) {
            const { start = new Date(Date.now() - timeInMs({ year: 1 })), end = new Date() } = val.dynamicDate;
            customized[doc] = randomDate(start, end);
          } else if (val?.enum?.length) {
            const rand = randomNumber(0, val.enum.length - 1);
            customized[doc] = val.enum[rand];
          } else if (val?.timestamp) {
            const now = new Date();
            customized[doc] = `Created at - ${now.toDateString()}`;
          }
        }

        return { ...customized, dummy: true, userId };
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
