import mongoose, { Schema, model, Document } from "mongoose";
import { Database } from "../class/Database";

export interface ISchedule extends Document {
  title: string;
  details?: string;
  start: Date;
  end?: Date;
  userId: mongoose.Types.ObjectId;
  isRecycled: boolean;
  deleteAt?: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    title: { type: String, required: true },
    details: String,
    start: { type: Date, required: true },
    end: Date,
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRecycled: { type: Boolean, default: false },
    deleteAt: { type: Date, default: undefined, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

const ScheduleRaw = model<ISchedule>("Schedule", ScheduleSchema);

export const Schedule = new Database(ScheduleRaw)
