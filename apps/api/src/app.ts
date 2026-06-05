import cors from "cors";
import express from "express";
import { authenticate } from "./middleware/auth.js";
import { AppError, errorHandler } from "./middleware/errorHandler.js";
import { createAuthRouter } from "./modules/auth/auth.routes.js";
import { createBookingsRouter } from "./modules/bookings/bookings.routes.js";
import { createSummaryRouter } from "./modules/summary/summary.routes.js";
import { createUsersRouter } from "./modules/users/users.routes.js";
import type { BookingRepository } from "./repositories/bookingRepository.js";
import { createHealthRouter } from "./routes/health.routes.js";

export function createApp(repository: BookingRepository) {
  const app = express();
  const requireAuth = authenticate(repository);

  app.use(cors());
  app.use(express.json());

  app.use(createHealthRouter());
  app.use("/api/auth", createAuthRouter(repository));
  app.use("/api/users", requireAuth, createUsersRouter(repository));
  app.use("/api/bookings", requireAuth, createBookingsRouter(repository));
  app.use("/api/summary", requireAuth, createSummaryRouter(repository));

  app.use((_request, _response, next) => {
    next(new AppError(404, "Route not found"));
  });

  app.use(errorHandler);

  return app;
}
