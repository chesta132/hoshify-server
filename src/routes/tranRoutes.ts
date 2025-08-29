import { createTran } from "@/controllers/transaction/createTran";
import { createTrans } from "@/controllers/transaction/createTrans";
import { deleteTran, deleteTrans } from "@/controllers/transaction/deleteTran";
import { editTran, editTrans } from "@/controllers/transaction/editTran";
import { getTran } from "@/controllers/transaction/getTran";
import { getTrans } from "@/controllers/transaction/getTrans";
import { restoreTran, restoreTrans } from "@/controllers/transaction/restoreTran";
import { polyBody } from "@/utils/polyBody";
import { Router } from "express";

export const tranRoutes = Router();

tranRoutes.post("/", polyBody(createTran, createTrans()));
tranRoutes.get("/", getTrans());
tranRoutes.get("/:id", getTran());
tranRoutes.put("/:id", editTran);
tranRoutes.put("/", editTrans());
tranRoutes.delete("/", deleteTrans());
tranRoutes.delete("/:id", deleteTran());
tranRoutes.patch("/", restoreTrans());
tranRoutes.patch("/:id", restoreTran());
