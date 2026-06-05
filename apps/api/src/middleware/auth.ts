import type { NextFunction, Request, Response } from "express";
import type { Role, User } from "../domain/types.js";
import type { BookingRepository } from "../repositories/bookingRepository.js";
import { AppError } from "./errorHandler.js";

declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}

export function authenticate(repository: BookingRepository) {
  return async (request: Request, _response: Response, next: NextFunction) => {
    try {
      const headerValue = request.header("x-user-id");
      const userId = Number(headerValue);

      if (!headerValue || !Number.isInteger(userId) || userId <= 0) {
        throw new AppError(401, "Missing or invalid x-user-id header");
      }

      const user = await repository.getUser(userId);
      if (!user) {
        throw new AppError(401, "User from x-user-id was not found");
      }

      request.currentUser = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireRoles(...allowedRoles: Role[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const user = request.currentUser;
    if (!user) {
      next(new AppError(401, "Authentication is required"));
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      next(new AppError(403, "You do not have permission to perform this action"));
      return;
    }

    next();
  };
}

export function getCurrentUser(request: Request): User {
  if (!request.currentUser) {
    throw new AppError(401, "Authentication is required");
  }
  return request.currentUser;
}
