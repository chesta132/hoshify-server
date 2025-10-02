import { createMoney } from "@/controllers/money/createMoney";
import { updateMoney } from "@/controllers/money/updateMoney";
import { refreshMoney } from "@/controllers/money/refreshMoney";
import { Router } from "express";
import { getMoney } from "@/controllers/money/getMoney";

export const moneyRoutes = Router();

moneyRoutes.get("/", getMoney);
moneyRoutes.post("/", createMoney);
moneyRoutes.put("/:id", updateMoney);
moneyRoutes.patch("/refresh/:id", refreshMoney);
