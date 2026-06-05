import { Router } from "express";
import type { BookingRepository } from "../../repositories/bookingRepository.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

export function createAuthRouter(repository: BookingRepository) {
  const router = Router();

  router.get(
    "/users",
    asyncHandler(async (_request, response) => {
      const users = await repository.listUsers();
      response.json({ users });
    })
  );

  return router;
}
