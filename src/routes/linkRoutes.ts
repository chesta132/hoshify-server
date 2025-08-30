import { deleteLink, deleteLinks } from "@/controllers/link/deleteLink";
import { createLink, createLinks, editLink, getLinks } from "@/controllers/link/link.factory";
import { polyBody } from "@/utils/polyBody";
import { Router } from "express";

export const linkRoutes = Router();

linkRoutes.post("/", polyBody(createLink, createLinks));
linkRoutes.get("/", getLinks);
linkRoutes.put("/:id", editLink);
linkRoutes.delete("/:id", deleteLink);
linkRoutes.delete("/", deleteLinks);
