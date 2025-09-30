import { prisma } from "@/services/db";
import { $Enums, Prisma } from "@prisma/client";
import { InternalArgs } from "@prisma/client/runtime/library";
import { BaseService } from "./Base";
import { applyPlugins } from "@/utils/manipulate/object";
import { SoftDeletePlugin } from "./plugins/SoftDeletePlugin";
import { ExtendPlugins } from "@/types/db";
import { DummyPlugin } from "./plugins/DummyPlugin";

export const transactionType: $Enums.TransactionType[] = ["INCOME", "OUTCOME"];

export class TransactionService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<
  Prisma.TransactionDelegate<ExtArgs, ClientOptions>,
  "transaction"
> {
  constructor(model: Prisma.TransactionDelegate<ExtArgs, ClientOptions>) {
    super(model, "transaction");

    const plugins = [
      new SoftDeletePlugin(model, "transaction"),
      new DummyPlugin(model, "transaction", {
        amount: { dynamicNumber: { max: 100_000_000, min: -100_000_000 } },
        type: { enum: transactionType },
        title: { dynamicString: "transaction" },
        details: { timestamp: true },
      }),
    ];

    return applyPlugins(this, ...plugins);
  }
}

export interface TransactionService<ExtArgs extends InternalArgs, ClientOptions>
  extends ExtendPlugins<Prisma.TransactionDelegate<ExtArgs, ClientOptions>, "transaction", "softDelete" | "dummy"> {}

export const Transaction = new TransactionService(prisma.transaction);
export type ModelTransaction = typeof Transaction;
