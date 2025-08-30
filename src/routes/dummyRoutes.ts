import { createDummy } from "@/controllers/dummy/createDummy";
import { deleteDummy } from "@/controllers/dummy/deleteDummy";
import { Note } from "@/models/Note";
import { Schedule } from "@/models/Schedule";
import { Todo } from "@/models/Todo";
import { Transaction } from "@/models/Transaction";
import { Router } from "express";

export const dummyRoutes = Router();

const supportDummy = [Note, Todo, Schedule, Transaction] as const;

supportDummy.forEach((model) => {
  dummyRoutes.post(`/${model.getName()}`, (req, res) => createDummy(model as any, req, res));
  dummyRoutes.delete(`/${model.getName()}`, (req, res) => deleteDummy(model as any, req, res));
});
