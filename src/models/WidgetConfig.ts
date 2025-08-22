import { ObjectId, Schema, model } from "mongoose";
import { Database } from "../class/Database";
import { virtualId } from "../utils/manipulate";
import { SchemaOptions } from "./User";
const WidgetTypes = ["WEATHER", "CHART", "MONEY_OVERVIEW", "SCHEDULE", "QUICK_LINKS", "TODO_3_DAY"] as const;

export interface IWidgetConfig {
  _id: ObjectId;
  type: (typeof WidgetTypes)[number];
  position: number;
  userId: ObjectId;
  settings: any;
  color: string;
}

const WidgetConfigSchema = new Schema(
  {
    type: { type: String, enum: WidgetTypes, required: true },
    position: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    settings: { type: Schema.Types.Mixed, default: {} },
    color: { type: String, default: "9B5DE5" },
  },
  SchemaOptions
);

virtualId(WidgetConfigSchema);

const WidgetConfigRaw = model<IWidgetConfig>("WidgetConfig", WidgetConfigSchema);

export const WidgetConfig = new Database(WidgetConfigRaw);
