import "dotenv/config";
import { createApp } from "./app.js";
import { appConfig } from "./config/appConfig.js";
import { prisma } from "./db/prisma.js";
import { PrismaBookingRepository } from "./repositories/prismaBookingRepository.js";

const app = createApp(new PrismaBookingRepository(prisma));

const server = app.listen(appConfig.port, () => {
  console.log(`API listening on http://localhost:${appConfig.port}`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
