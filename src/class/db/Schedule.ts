import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import * as runtime from "@prisma/client/runtime/library.js";
import { BaseService } from "./Base";

type InternalArgs = runtime.Types.Extensions.InternalArgs;

export class ScheduleService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<
  Prisma.ScheduleDelegate<ExtArgs, ClientOptions>,
  "schedule"
> {
  constructor(model: Prisma.ScheduleDelegate<ExtArgs, ClientOptions>) {
    super(model, "schedule");
  }
}

export const Schedule = new ScheduleService(prisma.schedule);
