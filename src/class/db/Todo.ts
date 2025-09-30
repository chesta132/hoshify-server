import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import * as runtime from "@prisma/client/runtime/library.js";
import { BaseService } from "./Service";

type InternalArgs = runtime.Types.Extensions.InternalArgs;

export class TodoService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<Prisma.TodoDelegate<ExtArgs, ClientOptions>, "todo"> {
  constructor(model: Prisma.TodoDelegate<ExtArgs, ClientOptions>) {
    super(model, "todo");
  }
}

export const Todo = new TodoService(prisma.todo);
