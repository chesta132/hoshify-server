import { Router } from "express";
import { getUser } from "../controllers/user/getUser";
import { deleteUser } from "../controllers/user/deleteUser";
import { authMiddleware } from "../middlewares/auth";
import { editUser } from "../controllers/user/editUser";
import { initiateUser } from "../controllers/user/initiateUser";
export const userRoutes = Router();

userRoutes.use(authMiddleware);
userRoutes.get("/initiate", initiateUser);
userRoutes.get("/", getUser);
userRoutes.delete("/", deleteUser);
userRoutes.put("/", editUser);
