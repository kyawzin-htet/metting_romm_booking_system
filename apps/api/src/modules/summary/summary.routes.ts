import { Router } from "express";
import { requireRoles } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/errorHandler.js";
import type { BookingRepository } from "../../repositories/bookingRepository.js";

export function createSummaryRouter(repository: BookingRepository) {
  const router = Router();

  router.get(
    "/",
    requireRoles("admin", "owner"),
    asyncHandler(async (_request, response) => {
      const summary = await repository.getSummary();
      response.json({ summary });
    })
  );

  return router;
}
