import { updateTran } from "@/controllers/transaction/updateTran";
import {
  createTran,
  createTrans,
  deleteTran,
  deleteTrans,
  getTran,
  getTrans,
  restoreTran,
  restoreTrans,
} from "@/controllers/transaction/tranFactory";
import { polyBody } from "@/utils/polyBody";
import { Router } from "express";

export const tranRoutes = Router();

tranRoutes.post("/", polyBody(createTran, createTrans));
tranRoutes.get("/", getTrans);
tranRoutes.get("/:id", getTran);
tranRoutes.put("/:id", updateTran);
tranRoutes.delete("/", deleteTrans);
tranRoutes.delete("/:id", deleteTran);
tranRoutes.patch("/restores/", restoreTrans);
tranRoutes.patch("/restores/:id", restoreTran);
