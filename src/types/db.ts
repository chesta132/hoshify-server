import { PrismaClient } from "@prisma/client";

export type Models = Omit<PrismaClient, `$${string}`>;
export type Model = Models[keyof Models];
