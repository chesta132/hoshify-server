import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import { InternalArgs } from "@prisma/client/runtime/library";
import { BaseService } from "./Base";
import { SoftDeletePlugin } from "./plugins/SoftDeletePlugin";
import { applyPlugins } from "@/utils/manipulate/object";
import { ExtendPluginss } from "@/types/db";

export class ScheduleService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<
  Prisma.ScheduleDelegate<ExtArgs, ClientOptions>,
  "schedule"
> {
  constructor(model: Prisma.ScheduleDelegate<ExtArgs, ClientOptions>) {
    super(model, "schedule");
    return applyPlugins(this, new SoftDeletePlugin(model, "schedule"));
  }
}

export interface ScheduleService<ExtArgs extends InternalArgs, ClientOptions>
  extends ExtendPluginss<Prisma.ScheduleDelegate<ExtArgs, ClientOptions>, "schedule", "softDelete"> {}

export const Schedule = new ScheduleService(prisma.schedule);
export type ModelSchedule = typeof Schedule;
