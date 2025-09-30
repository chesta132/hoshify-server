import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import { InternalArgs } from "@prisma/client/runtime/library";
import { BaseService } from "./Base";
import { applyPlugins } from "@/utils/manipulate/object";
import { SoftDeletePlugin } from "./plugins/SoftDeletePlugin";
import { ExtendPluginss } from "@/types/db";

export class TransactionService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<
  Prisma.TransactionDelegate<ExtArgs, ClientOptions>,
  "transaction"
> {
  constructor(model: Prisma.TransactionDelegate<ExtArgs, ClientOptions>) {
    super(model, "transaction");
    return applyPlugins(this, new SoftDeletePlugin(model, "transaction"));
  }
}

export interface TransactionService<ExtArgs extends InternalArgs, ClientOptions>
  extends ExtendPluginss<Prisma.TransactionDelegate<ExtArgs, ClientOptions>, "transaction", "softDelete"> {}

export const Transaction = new TransactionService(prisma.transaction);
export type ModelTransaction = typeof Transaction;
