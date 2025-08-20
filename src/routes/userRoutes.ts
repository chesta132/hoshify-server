import { Router } from "express";
import { getUser } from "../controllers/user/getUser";
import { deleteUser } from "../controllers/user/deleteUser";
import { authMiddleware } from "../middlewares/auth";
import { editUser } from "../controllers/user/editUser";
export const userRoutes = Router();

userRoutes.use(authMiddleware);
userRoutes.patch("/", getUser);
userRoutes.delete("/", deleteUser);
userRoutes.put("/", editUser);
