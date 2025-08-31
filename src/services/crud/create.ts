import { Normalized } from "@/types/types";
import { Model } from "mongoose";

export const create = async <T, Z extends Partial<T>[] | Partial<T> = T>(model: Model<T>, doc: Z): Promise<Normalized<T, Z>> => {
  if (Array.isArray(doc)) {
    const query = (await model.create(doc)).map((q) => q.normalize());
    return query as any;
  } else {
    const query = (await model.create(doc)).normalize();
    return query as any;
  }
};
