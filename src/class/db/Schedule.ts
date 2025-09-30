import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import * as runtime from "@prisma/client/runtime/library.js";
import { BaseService } from "./Base";
import { SoftDeletePlugin } from "./plugins/SoftDeletePlugin";
import { applyPlugins } from "@/utils/manipulate/object";

type InternalArgs = runtime.Types.Extensions.InternalArgs;

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
  extends SoftDeletePlugin<Prisma.ScheduleDelegate<ExtArgs, ClientOptions>, "schedule"> {}

export const Schedule = new ScheduleService(prisma.schedule);
export type ModelSchedule = typeof Schedule;
