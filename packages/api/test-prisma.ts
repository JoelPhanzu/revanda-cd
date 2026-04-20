import "dotenv/config";
import { PrismaClient } from "./src/generated/prisma/client";

const prisma = new PrismaClient();

prisma.$queryRaw`SELECT 1`
  .then(() => {
    console.log("✅ Prisma peut se connecter!");
    process.exit(0);
  })
  .catch((e: any) => {
    console.error("❌ ERREUR Prisma:", (e as Error).message);
    process.exit(1);
  });