import { Router } from "express";
import { getUser } from "../controllers/user/getUser";
import { deleteUser } from "../controllers/user/deleteUser";
import { editUser } from "../controllers/user/editUser";
import { initiateUser } from "../controllers/user/initiateUser";
export const userRoutes = Router();

userRoutes.get("/initiate", initiateUser);
userRoutes.get("/", getUser);
userRoutes.delete("/", deleteUser);
userRoutes.put("/", editUser);
