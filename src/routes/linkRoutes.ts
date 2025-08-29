import { createLink } from "@/controllers/link/createLink";
import { createLinks } from "@/controllers/link/createLinks";
import { deleteLink } from "@/controllers/link/deleteLink";
import { editLink } from "@/controllers/link/editLink";
import { getLinks } from "@/controllers/link/getLinks";
import { polyBody } from "@/utils/polyBody";
import { Router } from "express";

export const linkRoutes = Router();

linkRoutes.post("/", polyBody(createLink, createLinks));
linkRoutes.get("/", getLinks());
linkRoutes.put("/:id", editLink);
linkRoutes.delete("/:id", deleteLink);
