import { getMany } from "../templates/getMany";
import { Link } from "@/models/Link";

export const getLinks = () => {
  return getMany(Link);
};
