import { ObjectId, Schema, model } from "mongoose";
import { Database } from "../class/Database";
import { virtualSchema } from "../utils/manipulate";
import { schemaOptions } from "./User";

const VerifyType = ["CHANGE_EMAIL_OTP", "RESET_PASSWORD_OTP", "DELETE_ACCOUNT_OTP", "VERIFY_EMAIL", "REQUEST_ROLE"] as const;

export interface IVerify {
  _id: ObjectId;
  value: string;
  type: (typeof VerifyType)[number];
  userId: ObjectId | string;
  deleteAt: Date;
}

const VerifySchema = new Schema(
  {
    value: { type: String, required: true },
    type: { type: String, enum: VerifyType, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deleteAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  schemaOptions
);

virtualSchema(VerifySchema);

const VerifyRaw = model<IVerify>("Verify", VerifySchema);

export const Verify = new Database(VerifyRaw);
