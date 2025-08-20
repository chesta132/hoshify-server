import mongoose, { Schema, model, Document } from "mongoose";
import { Database } from "../class/Database";

const TransactionType = ["INCOME", "OUTCOME"] as const;

export interface ITransaction extends Document {
  amount: number;
  type: (typeof TransactionType)[number];
  title?: string;
  details?: string;
  date: Date;
  userId: mongoose.Types.ObjectId;
  isRecycled: boolean;
  deleteAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    amount: { type: Number, required: true },
    type: { type: String, enum: TransactionType, required: true },
    title: String,
    details: String,
    date: { type: Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRecycled: { type: Boolean, default: false },
    deleteAt: { type: Date, default: undefined, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

const TransactionRaw = model<ITransaction>("Transaction", TransactionSchema);

export const Transaction = new Database(TransactionRaw);
