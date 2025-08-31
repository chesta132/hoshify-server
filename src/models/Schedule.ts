import { ObjectId, Schema, model } from "mongoose";
import { schemaOptions } from "./User";
import { dummyPlugin, softDeletePlugin, virtualSchema } from "@/utils/database/plugin";

export interface ISchedule {
  _id: ObjectId;
  title: string;
  details: string;
  start: Date;
  end: Date;
  userId: ObjectId | string;
  isRecycled: boolean;
  deleteAt: Date | null;
  dummy: boolean;
}

const ScheduleSchema = new Schema(
  {
    title: { type: String, required: true, maxLength: 100 },
    details: { type: String, required: true, default: "" },
    start: { type: Date, default: Date.now },
    end: { type: Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRecycled: { type: Boolean, default: false },
    deleteAt: { type: Date, default: null, index: { expireAfterSeconds: 0 } },
    dummy: Boolean,
  },
  schemaOptions
);

ScheduleSchema.plugin(softDeletePlugin);
ScheduleSchema.plugin(dummyPlugin);

virtualSchema(ScheduleSchema);

export const Schedule = model<ISchedule>("Schedule", ScheduleSchema);
