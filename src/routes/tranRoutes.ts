import { createTran } from "@/controllers/transaction/createTran";
import { editTran } from "@/controllers/transaction/editTran";
import {
  createTrans,
  deleteTran,
  deleteTrans,
  editTrans,
  getTran,
  getTrans,
  restoreTran,
  restoreTrans,
} from "@/controllers/transaction/tran.factory";
import { polyBody } from "@/utils/polyBody";
import { Router } from "express";

export const tranRoutes = Router();

tranRoutes.post("/", polyBody(createTran, createTrans));
tranRoutes.get("/", getTrans);
tranRoutes.get("/:id", getTran);
tranRoutes.put("/:id", editTran);
tranRoutes.put("/", editTrans);
tranRoutes.delete("/", deleteTrans);
tranRoutes.delete("/:id", deleteTran);
tranRoutes.patch("/", restoreTrans);
tranRoutes.patch("/:id", restoreTran);
