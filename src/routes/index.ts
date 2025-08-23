import { Router } from "express";
import authRoutes from "./authRoutes";
import { userRoutes } from "./userRoutes";
import { authMiddleware, requireRole } from "@/middlewares/auth";
import { todoRoutes } from "./todoRoutes";
import { dummyRoutes } from "./dummyRoutes";
const router = Router();

router.use("/auth", authRoutes);

router.use(authMiddleware);
router.use("/user", userRoutes);
router.use("/todo", todoRoutes);

router.use((req, res, next) => requireRole(req, res, next, ["DEVELOPER", "OWNER"]));
router.use("/dummy", dummyRoutes);

router.get("/health", (req, res) => {
  res.json("OK");
});

export default router;
