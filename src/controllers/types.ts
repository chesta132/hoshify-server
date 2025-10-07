import { InferByModel, Model } from "@/services/db/types";
import { Respond } from "@/services/respond/Respond";
import { RequireAtLeastOne } from "@/types";
import { Request } from "express";

export type AdditionalOptions<T, NF, AF = Exclude<keyof T, NF>> = {
  // @ts-expect-error refactor later
  transformData?: (data: Pick<T, ExtractArray<NF | AF>>, req: Request, res: Respond) => Pick<T, NF | AF>;
};

export type ControllerOptions<T, Q, NF, AF, A extends keyof AdditionalOptions<any, any> = never> = {
  query?: Partial<Q>;
  funcBeforeRes?: (data: T, req: Request, res: Respond) => any;
  funcInitiator?: (req: Request, res: Respond) => Promise<"stop"> | "stop" | Promise<void> | void;
} & Pick<AdditionalOptions<T, NF, AF>, A>;

export type CreateConfig<T extends Model, NF extends keyof InferByModel<T>, AF extends Exclude<keyof InferByModel<T>, NF>> = RequireAtLeastOne<{
  neededField: NF[];
  acceptableField: AF[];
}>;

export type SearchConfig<T extends Model> = {
  searchFields: (keyof OmitByValue<PickByValue<InferByModel<T>, string>, Date>)[];
};
