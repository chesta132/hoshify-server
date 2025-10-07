import { createManyFactory } from "../factory/createMany";
import { getManyFactory } from "../factory/getMany";
import { getOneFactory } from "../factory/getOne";
import { restoreOneFactory } from "../factory/restoreOne";
import { restoreManyFactory } from "../factory/restoreMany";
import { softDeleteManyFactory } from "../factory/softDeleteMany";
import { softDeleteOneFactory } from "../factory/softDeleteOne";
import { updateManyFactory } from "../factory/updateMany";
import { createOneFactory } from "../factory/createOne";
import { updateOneFactory } from "../factory/updateOne";
import { Todo } from "@/services/db/Todo";
import { searchFactory } from "../factory/search";

export const createTodos = createManyFactory(Todo, { neededField: ["title", "details", "dueDate"], acceptableField: ["status"] });

export const getTodos = getManyFactory(Todo, { query: { orderBy: { dueDate: "asc" }, where: { isRecycled: false } } });

export const getTodo = getOneFactory(Todo);

export const restoreTodo = restoreOneFactory(Todo);

export const restoreTodos = restoreManyFactory(Todo, { query: { orderBy: { dueDate: "asc" } } });

export const deleteTodo = softDeleteOneFactory(Todo);

export const deleteTodos = softDeleteManyFactory(Todo, { query: { orderBy: { dueDate: "asc" } } });

export const updateTodos = updateManyFactory(
  Todo,
  { neededField: ["title", "details", "dueDate"], acceptableField: ["status"] },
  { query: { orderBy: { dueDate: "asc" } } }
);

export const createTodo = createOneFactory(Todo, { neededField: ["title", "details", "dueDate"], acceptableField: ["status"] });

export const updateTodo = updateOneFactory(Todo, { neededField: ["title", "details", "dueDate"], acceptableField: ["status"] });

export const searchTodos = searchFactory(Todo, {
  query: { where: { isRecycled: false }, orderBy: { dueDate: "asc" } },
});
