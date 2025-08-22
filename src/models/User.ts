import { Schema, SchemaOptions, model, ObjectId } from "mongoose";
import { Database } from "../class/Database";
import { virtualSchema } from "../utils/manipulate";
import { ITodo } from "./Todo";
import { INote } from "./Note";
import { ITransaction } from "./Transaction";
import { ISchedule } from "./Schedule";
import { IQuickLink } from "./QuickLink";
import { IWidgetConfig } from "./WidgetConfig";

export const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

export interface IUser {
  _id: ObjectId;
  fullName: string;
  email?: string;
  password?: string;
  gmail?: string;
  googleId?: string;
  verified: boolean;
  timeToAllowSendEmail: Date;
  createdAt: Date;
  todos?: ITodo;
  notes?: INote;
  transactions?: ITransaction;
  schedules?: ISchedule;
  quickLinks?: IQuickLink;
  widgetConfigs?: IWidgetConfig;
}

export const schemaOptions: SchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, { _id, __v, ...rest }) => {
      return { id: _id.toString(), ...rest };
    },
  },
};

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: {
      type: String,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, "Please enter a valid email"],
      index: 1,
    },
    password: {
      type: String,
      minlength: 6,
    },
    gmail: {
      type: String,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, "Please enter a valid gmail"],
      index: 1,
    },
    googleId: String,
    verified: { type: Boolean, default: false },
    timeToAllowSendEmail: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  schemaOptions
);

virtualSchema(UserSchema);

const virtualRef = (...ref: (string | [string, string])[]) => {
  for (const r of ref) {
    if (Array.isArray(r)) {
      const [name, ref] = r;
      UserSchema.virtual(name, {
        ref,
        localField: "_id",
        foreignField: "userId",
      });
      continue;
    }
    const name = r[0].toLowerCase() + r.slice(1) + "s";
    UserSchema.virtual(name, {
      ref: r,
      localField: "_id",
      foreignField: "userId",
    });
  }
};

virtualRef("Todo", "Note", "Transaction", "Schedule", ["links", "QuickLink"], ["widgets", "WidgetConfig"]);

const UserRaw = model<IUser>("User", UserSchema);

export const User = new Database(UserRaw);
