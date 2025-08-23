import { ObjectId, Schema, model } from "mongoose";
import { Database } from "../class/Database";
import { virtualSchema } from "../utils/manipulate";
import { schemaOptions } from "./User";
const WidgetTypes = ["WEATHER", "CHART", "MONEY_OVERVIEW", "SCHEDULE", "QUICK_LINKS", "TODO_3_DAY"] as const;

export interface IWidgetConfig {
  _id: ObjectId;
  type: (typeof WidgetTypes)[number];
  position: number;
  userId: ObjectId | string;
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
  schemaOptions
);

virtualSchema(WidgetConfigSchema);

const WidgetConfigRaw = model<IWidgetConfig>("WidgetConfig", WidgetConfigSchema);

export const WidgetConfig = new Database(WidgetConfigRaw);
