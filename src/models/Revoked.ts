import mongoose, { Schema, model, Document } from "mongoose";
import { Database } from "../class/Database";

const Revoke = ["TOKEN", "OTP"] as const;

export interface IRevoked extends Document {
  value: string;
  type: (typeof Revoke)[number];
  userId: mongoose.Types.ObjectId;
  deleteAt: Date;
}

const RevokedSchema = new Schema<IRevoked>(
  {
    value: { type: String, required: true },
    type: { type: String, enum: Revoke, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deleteAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

const RevokedRaw = model<IRevoked>("Revoked", RevokedSchema);

export const Revoked = new Database(RevokedRaw)
