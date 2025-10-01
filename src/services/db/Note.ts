import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import { BaseService } from "./Base";
import { applyPlugins } from "@/utils/manipulate/object";
import { SoftDeletePlugin } from "./plugins/SoftDeletePlugin";
import { InternalArgs } from "@prisma/client/runtime/library";
import { ExtendPlugins, InferByDelegate } from "@/services/db/types";
import { DummyPlugin } from "./plugins/DummyPlugin";

export class NoteService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<Prisma.NoteDelegate<ExtArgs, ClientOptions>, "note"> {
  constructor(model: Prisma.NoteDelegate<ExtArgs, ClientOptions>) {
    super(model, "note");
    const plugins = [
      new SoftDeletePlugin(model, "note"),
      new DummyPlugin(model, "note", { details: { timestamp: true }, title: { dynamicString: "note" } }),
    ];
    return applyPlugins(this, ...plugins);
  }
}

export interface NoteService<ExtArgs extends InternalArgs, ClientOptions>
  extends ExtendPlugins<Prisma.NoteDelegate<ExtArgs, ClientOptions>, "note", "softDelete" | "dummy"> {}

export const Note = new NoteService(prisma.note);
export type ModelNote = typeof Note;
export type TNote = InferByDelegate<typeof prisma.note>;
