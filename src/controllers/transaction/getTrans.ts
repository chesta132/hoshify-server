import { Transaction } from "@/models/Transaction";
import { getMany } from "../templates/getMany";

export const getTrans = () => {
  return getMany(Transaction);
};
