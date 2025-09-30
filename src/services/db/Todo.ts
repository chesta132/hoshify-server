import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import { InternalArgs } from "@prisma/client/runtime/library";
import { BaseService } from "./Base";
import { applyPlugins } from "@/utils/manipulate/object";
import { SoftDeletePlugin } from "./plugins/SoftDeletePlugin";
import { ExtendPlugins } from "@/types/db";

export class TodoService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<Prisma.TodoDelegate<ExtArgs, ClientOptions>, "todo"> {
  constructor(model: Prisma.TodoDelegate<ExtArgs, ClientOptions>) {
    super(model, "todo");
    return applyPlugins(this, new SoftDeletePlugin(model, "todo"));
  }
}

export interface TodoService<ExtArgs extends InternalArgs, ClientOptions>
  extends ExtendPlugins<Prisma.TodoDelegate<ExtArgs, ClientOptions>, "todo", "softDelete"> {}

export const Todo = new TodoService(prisma.todo);
export type ModelTodo = typeof Todo;
