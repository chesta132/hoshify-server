import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import * as runtime from "@prisma/client/runtime/library.js";
import { BaseService } from "./Service";

type InternalArgs = runtime.Types.Extensions.InternalArgs;

export class NoteService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<Prisma.NoteDelegate<ExtArgs, ClientOptions>, "note"> {
  constructor(model: Prisma.NoteDelegate<ExtArgs, ClientOptions>) {
    super(model, "note");
  }
}

export const Note = new NoteService(prisma.note);
