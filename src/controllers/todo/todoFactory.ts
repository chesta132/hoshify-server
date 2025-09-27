import { createManyFactory } from "../factory/createMany";
import { Todo } from "@/models/Todo";
import { getManyFactory } from "../factory/getMany";
import { getOneFactory } from "../factory/getOne";
import { restoreOneFactory } from "../factory/restoreOne";
import { restoreManyFactory } from "../factory/restoreMany";
import { softDeleteManyFactory } from "../factory/softDeleteMany";
import { softDeleteOneFactory } from "../factory/softDeleteOne";
import { updateManyFactory } from "../factory/updateMany";
import { createOneFactory } from "../factory/createOne";
import { updateOneFactory } from "../factory/updateOne";

export const createTodos = createManyFactory(Todo, { neededField: ["title", "details", "dueDate"], acceptableField: ["status"] });

export const getTodos = getManyFactory(Todo);

export const getTodo = getOneFactory(Todo);

export const restoreTodo = restoreOneFactory(Todo);

export const restoreTodos = restoreManyFactory(Todo);

export const deleteTodo = softDeleteOneFactory(Todo);

export const deleteTodos = softDeleteManyFactory(Todo);

export const updateTodos = updateManyFactory(Todo, { neededField: ["title", "details", "dueDate"], acceptableField: ["status"] });

export const createTodo = createOneFactory(Todo, { neededField: ["title", "details", "dueDate"], acceptableField: ["status"] });

export const updateTodo = updateOneFactory(Todo, { neededField: ["title", "details", "dueDate"], acceptableField: ["status"] });
