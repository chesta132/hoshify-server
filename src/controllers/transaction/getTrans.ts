import { Transaction } from "@/models/Transaction";
import { getMany } from "../templates/getMany";

export const getTrans = () => {
  console.debug("request");
  return getMany(Transaction);
};
