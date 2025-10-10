import { Router } from "express";
import authRoutes from "./authRoutes";
import { userRoutes } from "./userRoutes";
import { authMiddleware } from "@/middlewares/auth";
import { todoRoutes } from "./todoRoutes";
import { dummyRoutes } from "./dummyRoutes";
import { tranRoutes } from "./tranRoutes";
import { scheduleRoutes } from "./scheduleRoutes";
import { linkRoutes } from "./linkRoutes";
import { moneyRoutes } from "./moneyRoutes";
import { noteRoutes } from "./noteRoutes";
import { searchRoutes } from "./searchRoutes";

const router = Router();

router.get("/health", (req, res) => res.json("OK"));

router.use("/auth", authRoutes);

router.use(authMiddleware);

router.use("/user", userRoutes);
router.use("/todos", todoRoutes);
router.use("/transactions", tranRoutes);
router.use("/schedules", scheduleRoutes);
router.use("/links", linkRoutes);
router.use("/notes", noteRoutes);
router.use("/money", moneyRoutes);
router.use("/search", searchRoutes);
router.use("/dummys", dummyRoutes);

export default router;
