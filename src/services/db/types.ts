import { ModelLink } from "@/services/db/Link";
import { ModelMoney } from "@/services/db/Money";
import { ModelNote } from "@/services/db/Note";
import { DummyPlugin } from "@/services/db/plugins/DummyPlugin";
import { SoftDeletePlugin } from "@/services/db/plugins/SoftDeletePlugin";
import { ModelRevoked } from "@/services/db/Revoked";
import { ModelSchedule } from "@/services/db/Schedule";
import { ModelTodo } from "@/services/db/Todo";
import { ModelTransaction } from "@/services/db/Transaction";
import { ModelUser } from "@/services/db/User";
import { ModelVerify } from "@/services/db/Verify";
import { Prisma, PrismaClient } from "@prisma/client";
import { UnionToInter } from "../../types";
import { AppError } from "../error/AppError";

export type PrismaModels = Omit<PrismaClient, `$${string}`>;
export type PrismaModel = PrismaModels[keyof PrismaModels];

export type Models = {
  readonly user: ModelUser;
  readonly link: ModelLink;
  readonly money: ModelMoney;
  readonly note: ModelNote;
  readonly todo: ModelTodo;
  readonly schedule: ModelSchedule;
  readonly transaction: ModelTransaction;
  readonly verify: ModelVerify;
  readonly revoked: ModelRevoked;
};
export type Model<K extends keyof Models = keyof Models> = Models[K];
export type ModelNames = Lowercase<Prisma.ModelName>;

type Func = (...args: any) => any;

export type DefaultModelDelegate = {
  findFirstOrThrow: Func;
  findUniqueOrThrow: Func;
  create: Func;
  update: Func;
  delete: Func;
  findMany: Func;
  updateMany: Func;
  deleteMany: Func;
  createMany: Func;
  createManyAndReturn: Func;
};

export type ArgsOf<F extends Func> = Parameters<F>[0];
export type ArgsOfById<F extends Func> = Omit<ArgsOf<F>, "where">;
export type PromiseReturn<F extends Func> = Awaited<ReturnType<F>>;

export type AvailablePlugins<M extends DefaultModelDelegate, N extends ModelNames> = { softDelete: SoftDeletePlugin<M, N>; dummy: DummyPlugin<M, N> };
export type ExtendPlugins<M extends DefaultModelDelegate, N extends ModelNames, P extends keyof AvailablePlugins<M, N>> = UnionToInter<
  AvailablePlugins<M, N>[P]
>;

type Infer<F extends Func> = ArgsOf<F>["data"];

type Requiring<M extends DefaultModelDelegate> = Required<{
  [K in keyof Infer<M["update"]>]: Infer<M["update"]>[K] extends Prisma.NullableBoolFieldUpdateOperationsInput
    ? null | Infer<M["update"]>[K]
    : Infer<M["update"]>[K] extends Prisma.NullableDateTimeFieldUpdateOperationsInput
    ? null | Infer<M["update"]>[K]
    : Infer<M["update"]>[K] extends Prisma.NullableStringFieldUpdateOperationsInput
    ? null | Infer<M["update"]>[K]
    : Infer<M["update"]>[K];
}>;

export type InferByDelegate<M extends DefaultModelDelegate, O extends keyof Infer<M["update"]> = never> = Requiring<M> &
  Partial<Pick<Requiring<M>, O>>;

export type InferByModel<M extends Model, O extends keyof Infer<M["prisma"]["update"]> = never> = InferByDelegate<M["prisma"], O>;

export type ServiceError = AppError<any> | null;
export type ServiceOptions<E extends ServiceError> = {
  error?: E;
};

export type ServiceResult<F extends Func, E extends ServiceError> = [E] extends [null] ? PromiseReturn<F> | null : PromiseReturn<F>;

export type ModelSoftDeletable = "note" | "transaction" | "todo" | "schedule";
export type ModelDummyable = "note" | "transaction" | "todo" | "schedule";
