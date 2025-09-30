import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import * as runtime from "@prisma/client/runtime/library.js";
import { BaseService } from "./Base";
import { applyPlugins } from "@/utils/manipulate/object";
import { SoftDeletePlugin } from "./plugins/SoftDeletePlugin";

type InternalArgs = runtime.Types.Extensions.InternalArgs;

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
  extends SoftDeletePlugin<Prisma.TransactionDelegate<ExtArgs, ClientOptions>, "transaction"> {}

export const Transaction = new TransactionService(prisma.transaction);
