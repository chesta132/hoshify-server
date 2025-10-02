// import { Link } from "@/services/db/Link";
// import { Money } from "@/services/db/Money";
// import { Note } from "@/services/db/Note";
// import { Revoked } from "@/services/db/Revoked";
// import { Schedule } from "@/services/db/Schedule";
// import { Todo } from "@/services/db/Todo";
// import { Transaction } from "@/services/db/Transaction";
// import { User } from "@/services/db/User";
// import { Verify } from "@/services/db/Verify";
// import { Models } from "@/services/db/types";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// const db: Models = {
//   user: User,
//   link: Link,
//   money: Money,
//   note: Note,
//   revoked: Revoked,
//   schedule: Schedule,
//   todo: Todo,
//   transaction: Transaction,
//   verify: Verify,
// };

// export default db;
