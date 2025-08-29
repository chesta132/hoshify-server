import { createMoney } from "@/controllers/money/createMoney";
import { editMoney } from "@/controllers/money/editMoney";
import { refreshMoney } from "@/controllers/money/refreshMoney";
import { Router } from "express";

export const moneyRoutes = Router();

moneyRoutes.post("/", createMoney);
moneyRoutes.put("/:id", editMoney);
moneyRoutes.patch("/refresh/:id", refreshMoney);
