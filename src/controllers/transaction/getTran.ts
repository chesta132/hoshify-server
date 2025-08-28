import { getOne } from "../templates/getOne";
import { Transaction } from "@/models/Transaction";

export const getTran = () => {
  return getOne(Transaction);
};
