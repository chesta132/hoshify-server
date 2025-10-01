import { createDummy } from "@/controllers/dummy/createDummy";
import { deleteDummy } from "@/controllers/dummy/deleteDummy";
import { Note } from "@/services/db/Note";
import { Schedule } from "@/services/db/Schedule";
import { Todo } from "@/services/db/Todo";
import { Transaction } from "@/services/db/Transaction";
import { Model, ModelDummyable } from "@/services/db/types";
import { Router } from "express";

export const dummyRoutes = Router();

const supportDummy: Model<ModelDummyable>[] = [Note, Todo, Schedule, Transaction];

supportDummy.forEach((model) => {
  dummyRoutes.post(`/${model.modelName}`, createDummy(model));
  dummyRoutes.delete(`/${model.modelName}`, deleteDummy(model));
});
