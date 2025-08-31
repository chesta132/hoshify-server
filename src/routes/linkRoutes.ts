import { deleteLink, deleteLinks } from "@/controllers/link/deleteLink";
import { createLink, createLinks, updateLink, getLinks } from "@/controllers/link/link.factory";
import { polyBody } from "@/utils/polyBody";
import { Router } from "express";

export const linkRoutes = Router();

linkRoutes.post("/", polyBody(createLink, createLinks));
linkRoutes.get("/", getLinks);
linkRoutes.put("/:id", updateLink);
linkRoutes.delete("/:id", deleteLink);
linkRoutes.delete("/", deleteLinks);
