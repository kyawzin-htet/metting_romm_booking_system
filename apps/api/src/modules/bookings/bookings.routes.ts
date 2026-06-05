import { Router } from "express";
import { getCurrentUser } from "../../middleware/auth.js";
import { AppError, asyncHandler } from "../../middleware/errorHandler.js";
import type { BookingRepository } from "../../repositories/bookingRepository.js";
import {
  createBookingSchema,
  parseId,
  parseUtcIsoDate,
  parseZod
} from "../../shared/validation.js";

export function createBookingsRouter(repository: BookingRepository) {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_request, response) => {
      const bookings = await repository.listBookings();
      response.json({ bookings });
    })
  );

  router.post(
    "/",
    asyncHandler(async (request, response) => {
      const currentUser = getCurrentUser(request);
      const input = parseZod(createBookingSchema, request.body);
      const startTime = parseUtcIsoDate(input.startTime, "startTime");
      const endTime = parseUtcIsoDate(input.endTime, "endTime");

      if (startTime >= endTime) {
        throw new AppError(400, "startTime must be before endTime");
      }

      const overlap = await repository.findOverlappingBooking(startTime, endTime);
      if (overlap) {
        throw new AppError(400, "Booking overlaps an existing booking");
      }

      const booking = await repository
        .createBooking({
          userId: currentUser.id,
          startTime,
          endTime
        })
        .catch((error: unknown) => {
          if (String(error).includes("bookings_no_overlap")) {
            throw new AppError(400, "Booking overlaps an existing booking");
          }
          throw error;
        });

      response.status(201).json({ booking });
    })
  );

  router.delete(
    "/:id",
    asyncHandler(async (request, response) => {
      const currentUser = getCurrentUser(request);
      const id = parseId(request.params.id, "Booking id");
      const booking = await repository.getBooking(id);

      if (!booking) {
        throw new AppError(404, "Booking not found");
      }

      const canDelete =
        currentUser.role === "admin" ||
        currentUser.role === "owner" ||
        booking.userId === currentUser.id;

      if (!canDelete) {
        throw new AppError(403, "You can only delete your own bookings");
      }

      await repository.deleteBooking(id);
      response.status(204).send();
    })
  );

  return router;
}
