import { Model } from "@/types/db";
import { prisma } from "../db";

type ParamOf<F extends () => any> = Omit<Parameters<F>, "data">;
type DataOf<F extends () => any> = ParamOf<F>[0]["data"];

export function create<M extends Model, T>(model: M, data: DataOf<M["create"]>, ...props: ParamOf<M["create"]>): ReturnType<M["create"]>;
export function create<M extends Model, T>(model: M, data: DataOf<M["createMany"]>, ...props: ParamOf<M["createMany"]>): ReturnType<M["createMany"]>;
export function create<M extends Model, T>(model: M, data: DataOf<M["createMany"]>, ...props: ParamOf<M["createMany"]> | ParamOf<M["create"]>): any {
  if (Array.isArray(data)) {
    return model.createMany({ data, ...props });
  } else {
    return model.create({ data, ...props });
  }
}
