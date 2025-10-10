import { Request, Response, NextFunction } from "express";
import { PAGINATION_LIMIT } from "@/config";
import { AppError } from "@/services/error/AppError";
import { ModelSearchable } from "@/services/db/types";
import { Note } from "@/services/db/Note";
import { Todo } from "@/services/db/Todo";
import { Schedule } from "@/services/db/Schedule";

const SEARCH_MANY_FIELDS = { note: Note.searchFields, schedule: Schedule.searchFields, todo: Todo.searchFields };
const SEARCH_MANY_SORTS = { note: Note.sortQuery, schedule: Schedule.sortQuery, todo: Todo.sortQuery };

export const searchMany = async (req: Request, { res }: Response, next: NextFunction) => {
  try {
    const q = req.query.query?.toString().trim();
    let models = req.query.models?.toString() as ModelSearchable | ModelSearchable[] | undefined;
    let { sort, sortBy } = req.query;
    const limit = PAGINATION_LIMIT;

    if (!q) {
      throw new AppError("MISSING_FIELDS", { fields: "query" });
    }
    if (!models) {
      models = ["note", "schedule", "todo"];
    } else if (typeof models === "string") {
      models = models.split(",") as ModelSearchable[];
    }

    const getQuery = (model: ModelSearchable) => ({
      where: {
        OR: SEARCH_MANY_FIELDS[model].map((field) => ({
          [field]: { contains: q, mode: "insensitive" },
        })),
      },
      take: limit,
      orderBy: sortBy && (sort === "asc" || sort === "desc") ? { ...SEARCH_MANY_SORTS[model], [sortBy.toString()]: sort } : SEARCH_MANY_SORTS[model],
    });

    const notes = models.includes("note") && (await Note.findMany(getQuery("note")));
    const todos = models.includes("todo") && (await Todo.findMany(getQuery("todo")));
    const schedules = models.includes("schedule") && (await Schedule.findMany(getQuery("schedule")));

    const datas = { notes, todos, schedules };
    Object.typedKeys(datas).forEach((key) => !datas[key] && delete datas[key]);

    res.body({ success: datas }).respond();
  } catch (err) {
    next(err);
  }
};
