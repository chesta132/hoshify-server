import { Router } from "express";
import authRoutes from "./authRoutes";
import { userRoutes } from "./userRoutes";
import { authMiddleware, requireRole } from "@/middlewares/auth";
import { todoRoutes } from "./todoRoutes";
import { dummyRoutes } from "./dummyRoutes";
import { tranRoutes } from "./tranRoutes";
import { scheduleRoutes } from "./scheduleRoutes";
import { linkRoutes } from "./linkRoutes";
import { moneyRoutes } from "./moneyRoutes";
const router = Router();

router.use("/auth", authRoutes);

router.use(authMiddleware);
router.use("/user", userRoutes);
router.use("/todos", todoRoutes);
router.use("/transactions", tranRoutes);
router.use("/schedules", scheduleRoutes);
router.use("/links", linkRoutes);
router.use("/money", moneyRoutes);

router.use(requireRole(["DEVELOPER", "OWNER"]));
router.use("/dummys", dummyRoutes);

router.get("/health", (req, res) => {
  res.json("OK");
});

export default router;
