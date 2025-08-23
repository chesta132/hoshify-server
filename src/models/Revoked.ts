import { ObjectId, Schema, model } from "mongoose";
import { Database } from "../class/Database";
import { virtualSchema } from "../utils/manipulate";
import { schemaOptions } from "./User";

const Revoke = ["TOKEN", "OTP"] as const;

export interface IRevoked {
  _id: ObjectId;
  value: string;
  type: (typeof Revoke)[number];
  userId: ObjectId | string;
  deleteAt: Date;
}

const RevokedSchema = new Schema(
  {
    value: { type: String, required: true },
    type: { type: String, enum: Revoke, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deleteAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  schemaOptions
);

virtualSchema(RevokedSchema);

const RevokedRaw = model<IRevoked>("Revoked", RevokedSchema);

export const Revoked = new Database(RevokedRaw);
