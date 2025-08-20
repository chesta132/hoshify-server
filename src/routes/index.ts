import { Router } from "express";
import authRoutes from "./authRoutes";
import { userRoutes } from "./userRoutes";
const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);

router.get("/health", (req, res) => {
  res.json("OK");
});

export default router;
