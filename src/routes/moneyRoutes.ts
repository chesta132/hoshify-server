import { createMoney } from "@/controllers/money/createMoney";
import { updateMoney } from "@/controllers/money/updateMoney";
import { refreshMoney } from "@/controllers/money/refreshMoney";
import { Router } from "express";

export const moneyRoutes = Router();

moneyRoutes.post("/", createMoney);
moneyRoutes.put("/:id", updateMoney);
moneyRoutes.patch("/refresh/:id", refreshMoney);
