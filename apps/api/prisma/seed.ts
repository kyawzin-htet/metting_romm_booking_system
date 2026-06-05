import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "bookings", "users" RESTART IDENTITY CASCADE');

  await prisma.user.createMany({
    data: [
      { name: "Ada Admin", role: "admin" },
      { name: "Owen Owner", role: "owner" },
      { name: "Uma User", role: "user" },
      { name: "Taylor Tech", role: "user" }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
