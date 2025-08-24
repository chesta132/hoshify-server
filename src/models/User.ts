import { Schema, SchemaOptions, model, ObjectId, PopulateOptions } from "mongoose";
import { Database } from "../class/Database";
import { virtualSchema } from "../utils/manipulate";
import { ITodo } from "./Todo";
import { INote } from "./Note";
import { ITransaction } from "./Transaction";
import { ISchedule } from "./Schedule";
import { IQuickLink } from "./QuickLink";
import { IWidget } from "./Widget";

export const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
export const userRole = ["OWNER", "DEVELOPER", "USER"] as const;
export type UserRole = (typeof userRole)[number];

export interface IUser {
  _id: ObjectId;
  fullName: string;
  email?: string;
  password?: string;
  gmail?: string;
  googleId?: string;
  verified: boolean;
  role: UserRole;
  timeToAllowSendEmail: Date;
  createdAt: Date;
  todos?: ITodo;
  notes?: INote;
  transactions?: ITransaction;
  schedules?: ISchedule;
  links?: IQuickLink;
  widgets?: IWidget;
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
    fullName: { type: String, required: true, maxLength: 20 },
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
    role: {
      type: String,
      enum: userRole,
      default: "USER",
      required: true,
      uppercase: true,
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

virtualRef("Todo", "Note", "Transaction", "Schedule", ["links", "QuickLink"], ["widgets", "Widget"]);

export type UserPopulateField = "links" | "transactions" | "notes" | "schedules" | "todos" | "widgets";

const sortMap: Partial<Record<UserPopulateField, object>> & { default: object } = {
  schedules: { start: -1 },
  widgets: { position: -1 },
  links: { position: -1 },
  default: { updatedAt: -1 },
};

export type BuildUserPopulateProps = Partial<Record<UserPopulateField, number | "all">>;

export const buildUserPopulate = (config: BuildUserPopulateProps) => {
  return Object.entries(config).map(([f, l]) => {
    const field = f as UserPopulateField;
    const limit = l === "all" ? undefined : l;
    return { path: field, options: { limit, sort: sortMap[field] || sortMap.default } } as PopulateOptions;
  });
};

const UserRaw = model<IUser>("User", UserSchema);

export const User = new Database(UserRaw);
