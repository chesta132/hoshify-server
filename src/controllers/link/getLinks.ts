import { Request, Response } from "express";
import { getMany } from "../templates/getMany";
import { Link } from "@/models/Link";

export const getLinks = async (req: Request, { res }: Response) => {
  await getMany(Link, req, res);
};
