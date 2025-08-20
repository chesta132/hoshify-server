import mongoose, { Schema, model, Document } from "mongoose";
import { Database } from "../class/Database";

const VerifyType = ["CHANGE_EMAIL_OTP", "RESET_PASSWORD_OTP", "DELETE_ACCOUNT_OTP", "VERIFY_EMAIL"] as const;

export interface IVerify extends Document {
  value: string;
  type: (typeof VerifyType)[number];
  userId: mongoose.Types.ObjectId;
  deleteAt: Date;
}

const VerifySchema = new Schema<IVerify>(
  {
    value: { type: String, required: true },
    type: { type: String, enum: VerifyType, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deleteAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

const VerifyRaw = model<IVerify>("Verify", VerifySchema);

export const Verify = new Database(VerifyRaw);
