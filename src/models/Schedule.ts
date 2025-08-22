import { ObjectId, Schema, model } from "mongoose";
import { Database } from "../class/Database";
import { virtualSchema } from "../utils/manipulate";
import { schemaOptions } from "./User";

export interface ISchedule {
  _id: ObjectId;
  title: string;
  details?: string;
  start: Date;
  end?: Date;
  userId: ObjectId;
  isRecycled: boolean;
  deleteAt?: Date;
}

const ScheduleSchema = new Schema(
  {
    title: { type: String, required: true },
    details: String,
    start: { type: Date, required: true },
    end: Date,
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRecycled: { type: Boolean, default: false },
    deleteAt: { type: Date, default: undefined, index: { expireAfterSeconds: 0 } },
  },
  schemaOptions
);

virtualSchema(ScheduleSchema);

const ScheduleRaw = model<ISchedule>("Schedule", ScheduleSchema);

export const Schedule = new Database(ScheduleRaw);
