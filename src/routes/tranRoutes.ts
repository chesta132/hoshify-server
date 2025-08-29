import { createTran } from "@/controllers/transaction/createTran";
import { deleteTran, deleteTrans } from "@/controllers/transaction/deleteTran";
import { editTran } from "@/controllers/transaction/editTran";
import { getTran } from "@/controllers/transaction/getTran";
import { getTrans } from "@/controllers/transaction/getTrans";
import { restoreTran, restoreTrans } from "@/controllers/transaction/restoreTran";
import { Router } from "express";

export const tranRoutes = Router();

tranRoutes.post("/", createTran);
tranRoutes.get("/", getTrans());
tranRoutes.get("/:id", getTran());
tranRoutes.put("/:id", editTran);
tranRoutes.delete("/", deleteTrans());
tranRoutes.delete("/:id", deleteTran());
tranRoutes.patch("/", restoreTrans());
tranRoutes.patch("/:id", restoreTran());
