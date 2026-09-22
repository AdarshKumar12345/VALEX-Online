import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import env from "./env.js";

const { PrismaClient } = pkg;

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default prisma;