import { prisma } from "@/services/db";
import { $Enums, Prisma } from "@prisma/client";
import { InternalArgs } from "@prisma/client/runtime/library";
import { BaseService } from "./Base";
import { applyPlugins } from "@/utils/manipulate/object";
import { SoftDeletePlugin } from "./plugins/SoftDeletePlugin";
import { ExtendPlugins } from "@/types/db";
import { DummyPlugin } from "./plugins/DummyPlugin";
import { timeInMs } from "@/utils/manipulate/number";

export const todoStatus: $Enums.TodoStatus[] = ["ACTIVE", "CANCELED", "COMPLETED", "PENDING"];

export class TodoService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<Prisma.TodoDelegate<ExtArgs, ClientOptions>, "todo"> {
  constructor(model: Prisma.TodoDelegate<ExtArgs, ClientOptions>) {
    super(model, "todo");

    const nextYear = new Date(Date.now() + timeInMs({ year: 1 }));
    const plugins = [
      new SoftDeletePlugin(model, "todo"),
      new DummyPlugin(model, "todo", {
        details: { timestamp: true },
        title: { dynamicString: "todo" },
        dueDate: { dynamicDate: { start: new Date(), end: nextYear } },
        status: { enum: todoStatus },
      }),
    ];
    return applyPlugins(this, new SoftDeletePlugin(model, "todo"));
  }
}

export interface TodoService<ExtArgs extends InternalArgs, ClientOptions>
  extends ExtendPlugins<Prisma.TodoDelegate<ExtArgs, ClientOptions>, "todo", "softDelete" | "dummy"> {}

export const Todo = new TodoService(prisma.todo);
export type ModelTodo = typeof Todo;
