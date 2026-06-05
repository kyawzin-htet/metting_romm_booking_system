import type { Booking, BookingWithUser, Role, UsageSummary, User } from "../domain/types.js";

export type CreateUserInput = {
  name: string;
  role: Role;
};

export type UpdateUserInput = {
  name?: string;
  role?: Role;
};

export type CreateBookingInput = {
  userId: number;
  startTime: Date;
  endTime: Date;
};

export interface BookingRepository {
  listUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | null>;
  createUser(input: CreateUserInput): Promise<User>;
  updateUser(id: number, input: UpdateUserInput): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;
  listBookings(): Promise<BookingWithUser[]>;
  getBooking(id: number): Promise<BookingWithUser | null>;
  findOverlappingBooking(startTime: Date, endTime: Date): Promise<Booking | null>;
  createBooking(input: CreateBookingInput): Promise<BookingWithUser>;
  deleteBooking(id: number): Promise<boolean>;
  getSummary(): Promise<UsageSummary>;
}
