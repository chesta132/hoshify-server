import { ObjectId, Schema, model } from "mongoose";
import { Database } from "../class/Database";
import { virtualSchema } from "../utils/manipulate";
import { schemaOptions } from "./User";

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

virtualSchema(ScheduleSchema);

const ScheduleRaw = model<ISchedule>("Schedule", ScheduleSchema);

export const Schedule = new Database(ScheduleRaw);
