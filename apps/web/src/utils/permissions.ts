import { protectedAdminUserId } from "../constants";
import type { Booking, User } from "../types/domain";

export function canDeleteBooking(user: User, booking: Booking) {
  return user.role === "admin" || user.role === "owner" || booking.userId === user.id;
}

export function canDeleteUser(user: User) {
  return user.id !== protectedAdminUserId;
}
