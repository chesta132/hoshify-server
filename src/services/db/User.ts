import { prisma } from "@/services/db";
import { Prisma } from "@prisma/client";
import { BaseService } from "./Base";
import { InternalArgs } from "@prisma/client/runtime/library";
import { InferByDelegate } from "@/types/db";
import { TTodo } from "./Todo";
import { TNote } from "./Note";
import { TTransaction } from "./Transaction";
import { TSchedule } from "./Schedule";
import { TLink } from "./Link";
import { TMoney } from "./Money";

export class UserService<ExtArgs extends InternalArgs, ClientOptions> extends BaseService<Prisma.UserDelegate<ExtArgs, ClientOptions>, "user"> {
  constructor(model: Prisma.UserDelegate<ExtArgs, ClientOptions>) {
    super(model, "user");
  }
}

export const User = new UserService(prisma.user);
export type ModelUser = typeof User;
export type UserRelations = {
  todos: TTodo[];
  notes: TNote[];
  transactions: TTransaction[];
  schedules: TSchedule[];
  links: TLink[];
  money: TMoney;
};
export type TUser = InferByDelegate<typeof prisma.user, keyof UserRelations>;

export type UserCred = "password" | "googleId";
export const UserCreds: UserCred[] = ["password", "googleId"];
