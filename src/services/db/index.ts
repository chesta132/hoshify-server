import { Link } from "@/class/db/Link";
import { Money } from "@/class/db/Money";
import { Note } from "@/class/db/Note";
import { Revoked } from "@/class/db/Revoked";
import { Schedule } from "@/class/db/Schedule";
import { Todo } from "@/class/db/Todo";
import { Transaction } from "@/class/db/Transaction";
import { User } from "@/class/db/User";
import { Verify } from "@/class/db/Verify";
import { Models } from "@/types/db";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

const db: Models = {
  user: User,
  link: Link,
  money: Money,
  note: Note,
  revoked: Revoked,
  schedule: Schedule,
  todo: Todo,
  transaction: Transaction,
  verify: Verify,
};

export default db;
