import { ObjectId, Schema, model } from "mongoose";
import { virtualSchema } from "../utils/manipulate";
import { schemaOptions } from "./User";
import { dummyPlugin, softDeletePlugin } from "@/class/newDB";

export interface ISchedule {
  _id: ObjectId;
  title: string;
  details: string;
  start: Date;
  end: Date;
  userId: ObjectId | string;
  isRecycled: boolean;
  deleteAt?: Date;
  dummy: boolean;
}

const ScheduleSchema = new Schema(
  {
    title: { type: String, required: true, maxLength: 100 },
    details: { type: String, required: true },
    start: { type: Date, default: Date.now },
    end: { type: Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRecycled: { type: Boolean, default: false },
    deleteAt: { type: Date, default: undefined, index: { expireAfterSeconds: 0 } },
    dummy: { type: Boolean, default: false },
  },
  schemaOptions
);

ScheduleSchema.plugin(softDeletePlugin);
ScheduleSchema.plugin(dummyPlugin);

virtualSchema(ScheduleSchema);

export const Schedule = model<ISchedule>("Schedule", ScheduleSchema);
