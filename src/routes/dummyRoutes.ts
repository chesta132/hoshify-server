import { createDummy } from "@/controllers/dummy/createDummy";
import { deleteDummy } from "@/controllers/dummy/deleteDummy";
import { Link } from "@/models/Link";
import { Note } from "@/models/Note";
import { Schedule } from "@/models/Schedule";
import { Todo } from "@/models/Todo";
import { Transaction } from "@/models/Transaction";
import { Router } from "express";

export const dummyRoutes = Router();

const supportDummy = [Note, Todo, Schedule, Transaction];

supportDummy.forEach((model) => {
  dummyRoutes.post(`/${model.getName()}`, createDummy(model as any));
  dummyRoutes.delete(`/${model.getName()}`, deleteDummy(model as any));
});
