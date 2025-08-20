import mongoose, { Schema, model, Document } from "mongoose";
import { Database } from "../class/Database";
const WidgetTypes = ["WEATHER", "CHART", "MONEY_OVERVIEW", "SCHEDULE", "QUICK_LINKS", "TODO_3_DAY"] as const;

export interface IWidgetConfig extends Document {
  type: (typeof WidgetTypes)[number];
  position: number;
  userId: mongoose.Types.ObjectId;
  settings: any;
  color: string;
}

const WidgetConfigSchema = new Schema<IWidgetConfig>(
  {
    type: { type: String, enum: WidgetTypes, required: true },
    position: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    settings: { type: Schema.Types.Mixed, default: {} },
    color: { type: String, default: "9B5DE5" },
  },
  { timestamps: true }
);

const WidgetConfigRaw = model<IWidgetConfig>("WidgetConfig", WidgetConfigSchema);

export const WidgetConfig = new Database(WidgetConfigRaw);
