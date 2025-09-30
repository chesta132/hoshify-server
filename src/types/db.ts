import { ModelLink } from "@/class/db/Link";
import { ModelMoney } from "@/class/db/Money";
import { ModelNote } from "@/class/db/Note";
import { ModelRevoked } from "@/class/db/Revoked";
import { ModelSchedule } from "@/class/db/Schedule";
import { ModelTodo } from "@/class/db/Todo";
import { ModelTransaction } from "@/class/db/Transaction";
import { ModelUser } from "@/class/db/User";
import { ModelVerify } from "@/class/db/Verify";
import { PrismaClient } from "@prisma/client";

export type PrismaModels = Omit<PrismaClient, `$${string}`>;
export type PrismaModel = PrismaModels[keyof PrismaModels];

export type Models = {
  user: ModelUser;
  link: ModelLink;
  money: ModelMoney;
  note: ModelNote;
  todo: ModelTodo;
  schedule: ModelSchedule;
  transaction: ModelTransaction;
  verify: ModelVerify;
  revoked: ModelRevoked;
};
export type Model<K extends keyof Models = never> = K extends never ? Models[keyof Models] : Models[K];

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
