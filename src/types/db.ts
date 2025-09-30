import { PrismaClient } from "@prisma/client";

export type Models = Omit<PrismaClient, `$${string}`>;
export type Model = Models[keyof Models];

type Func = (...args: any) => any;

export type DefaultModelDelegate = {
  findFirstOrThrow: Func;
  findUniqueOrThrow: Func;
  findMany: Func;
  create: Func;
  update: Func;
  delete: Func;
};

export type ArgsOf<F extends () => any> = Parameters<F>[0];
export type ArgsOfById<F extends () => any> = Omit<ArgsOf<F>, "where">;
export type PromiseReturn<F extends () => any> = Awaited<ReturnType<F>>;
