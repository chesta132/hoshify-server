import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import { InternalArgs } from "@prisma/client/runtime/library";
import { BaseService } from "./Base";
import { SoftDeletePlugin } from "./plugins/SoftDeletePlugin";
import { applyPlugins } from "@/utils/manipulate/object";
import { ExtendPlugins } from "@/types/db";
import { DummyPlugin } from "./plugins/DummyPlugin";
import { timeInMs } from "@/utils/manipulate/number";

export class ScheduleService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<
  Prisma.ScheduleDelegate<ExtArgs, ClientOptions>,
  "schedule"
> {
  constructor(model: Prisma.ScheduleDelegate<ExtArgs, ClientOptions>) {
    super(model, "schedule");

    const nextYear = new Date(Date.now() + timeInMs({ year: 1 }));
    const plugins = [
      new SoftDeletePlugin(model, "schedule"),
      new DummyPlugin(model, "schedule", {
        end: { dynamicDate: { end: nextYear } },
        start: { dynamicDate: { start: new Date(), end: nextYear } },
        details: { timestamp: true },
        title: { dynamicString: "schedule" },
      }),
    ];

    return applyPlugins(this, ...plugins);
  }
}

export interface ScheduleService<ExtArgs extends InternalArgs, ClientOptions>
  extends ExtendPlugins<Prisma.ScheduleDelegate<ExtArgs, ClientOptions>, "schedule", "softDelete" | "dummy"> {}

export const Schedule = new ScheduleService(prisma.schedule);
export type ModelSchedule = typeof Schedule;
