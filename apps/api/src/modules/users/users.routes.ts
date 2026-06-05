import { Router } from "express";
import { appConfig } from "../../config/appConfig.js";
import { requireRoles } from "../../middleware/auth.js";
import { AppError, asyncHandler } from "../../middleware/errorHandler.js";
import type { BookingRepository } from "../../repositories/bookingRepository.js";
import {
  createUserSchema,
  parseId,
  parseZod,
  updateUserSchema
} from "../../shared/validation.js";

export function createUsersRouter(repository: BookingRepository) {
  const router = Router();

  router.use(requireRoles("admin"));

  router.get(
    "/",
    asyncHandler(async (_request, response) => {
      const users = await repository.listUsers();
      response.json({ users });
    })
  );

  router.post(
    "/",
    asyncHandler(async (request, response) => {
      const input = parseZod(createUserSchema, request.body);
      const user = await repository.createUser(input);
      response.status(201).json({ user });
    })
  );

  router.patch(
    "/:id",
    asyncHandler(async (request, response) => {
      const id = parseId(request.params.id, "User id");
      const input = parseZod(updateUserSchema, request.body);
      const user = await repository.updateUser(id, input);

      if (!user) {
        throw new AppError(404, "User not found");
      }

      response.json({ user });
    })
  );

  router.delete(
    "/:id",
    asyncHandler(async (request, response) => {
      const id = parseId(request.params.id, "User id");

      if (id === appConfig.protectedAdminUserId) {
        throw new AppError(403, "Ada Admin cannot be deleted");
      }

      const deleted = await repository.deleteUser(id);

      if (!deleted) {
        throw new AppError(404, "User not found");
      }

      response.status(204).send();
    })
  );

  return router;
}
