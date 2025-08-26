import { refreshMoney } from "@/controllers/money/refreshMoney";
import { Router } from "express";

export const moneyRoutes = Router();

moneyRoutes.patch("/", refreshMoney);
