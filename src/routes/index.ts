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
router.use("/todo", todoRoutes);
router.use("/transaction", tranRoutes);
router.use("/schedule", scheduleRoutes);
router.use("/link", linkRoutes);
router.use("/money", moneyRoutes);

router.use(requireRole(["DEVELOPER", "OWNER"]));
router.use("/dummy", dummyRoutes);

router.get("/health", (req, res) => {
  res.json("OK");
});

export default router;
