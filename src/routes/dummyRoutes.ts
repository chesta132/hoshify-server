import { createDummy } from "@/controllers/dummy/createDummy";
import { deleteDummy } from "@/controllers/dummy/deleteDummy";
import { Note } from "@/models/Note";
import { Schedule } from "@/models/Schedule";
import { Todo } from "@/models/Todo";
import { Transaction } from "@/models/Transaction";
import { Router } from "express";

export const dummyRoutes = Router();

const supportDummy = [
  { model: Note, name: "note" },
  { model: Todo, name: "todo" },
  { model: Schedule, name: "schedule" },
  { model: Transaction, name: "transaction" },
] as const;

supportDummy.forEach((dummy) => {
  const { model, name } = dummy;
  dummyRoutes.post(`/${name}`, (req, res) => createDummy(model as any, name, req, res));
  dummyRoutes.delete(`/${name}`, (req, res) => deleteDummy(model as any, name, req, res));
});
