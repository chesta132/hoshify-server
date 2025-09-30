import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import * as runtime from "@prisma/client/runtime/library.js";
import { BaseService } from "./Base";
import { applyPlugins } from "@/utils/manipulate/object";
import { SoftDeletePlugin } from "./plugins/SoftDeletePlugin";

type InternalArgs = runtime.Types.Extensions.InternalArgs;

export class NoteService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<Prisma.NoteDelegate<ExtArgs, ClientOptions>, "note"> {
  constructor(model: Prisma.NoteDelegate<ExtArgs, ClientOptions>) {
    super(model, "note");
    return applyPlugins(this, new SoftDeletePlugin(model, "note"));
  }
}

export interface NoteService<ExtArgs extends InternalArgs, ClientOptions>
  extends SoftDeletePlugin<Prisma.NoteDelegate<ExtArgs, ClientOptions>, "note"> {}

export const Note = new NoteService(prisma.note);
export type ModelNote = typeof Note;
