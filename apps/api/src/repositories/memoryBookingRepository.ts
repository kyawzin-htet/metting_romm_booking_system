import type {
  BookingRepository,
  CreateBookingInput,
  CreateUserInput,
  UpdateUserInput
} from "./bookingRepository.js";
import type { Booking, BookingWithUser, UsageSummary, User } from "../domain/types.js";

export class MemoryBookingRepository implements BookingRepository {
  private users: User[];
  private bookings: Booking[];
  private nextUserId: number;
  private nextBookingId: number;

  constructor(input?: { users?: User[]; bookings?: Booking[] }) {
    this.users = [...(input?.users ?? [])];
    this.bookings = [...(input?.bookings ?? [])];
    this.nextUserId = Math.max(0, ...this.users.map((user) => user.id)) + 1;
    this.nextBookingId = Math.max(0, ...this.bookings.map((booking) => booking.id)) + 1;
  }

  async listUsers(): Promise<User[]> {
    return [...this.users].sort((a, b) => a.id - b.id);
  }

  async getUser(id: number): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      name: input.name,
      role: input.role,
      createdAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id: number, input: UpdateUserInput): Promise<User | null> {
    const user = await this.getUser(id);
    if (!user) {
      return null;
    }
    Object.assign(user, input);
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    const originalLength = this.users.length;
    this.users = this.users.filter((user) => user.id !== id);
    if (this.users.length === originalLength) {
      return false;
    }
    this.bookings = this.bookings.filter((booking) => booking.userId !== id);
    return true;
  }

  async listBookings(): Promise<BookingWithUser[]> {
    return this.bookings
      .map((booking) => this.withUser(booking))
      .filter((booking): booking is BookingWithUser => Boolean(booking))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime() || a.id - b.id);
  }

  async getBooking(id: number): Promise<BookingWithUser | null> {
    const booking = this.bookings.find((item) => item.id === id);
    return booking ? this.withUser(booking) : null;
  }

  async findOverlappingBooking(startTime: Date, endTime: Date): Promise<Booking | null> {
    return (
      this.bookings.find(
        (booking) => startTime < booking.endTime && endTime > booking.startTime
      ) ?? null
    );
  }

  async createBooking(input: CreateBookingInput): Promise<BookingWithUser> {
    const booking: Booking = {
      id: this.nextBookingId++,
      userId: input.userId,
      startTime: input.startTime,
      endTime: input.endTime,
      createdAt: new Date()
    };
    this.bookings.push(booking);
    const bookingWithUser = this.withUser(booking);
    if (!bookingWithUser) {
      throw new Error("Booking user not found");
    }
    return bookingWithUser;
  }

  async deleteBooking(id: number): Promise<boolean> {
    const originalLength = this.bookings.length;
    this.bookings = this.bookings.filter((booking) => booking.id !== id);
    return this.bookings.length !== originalLength;
  }

  async getSummary(): Promise<UsageSummary> {
    return {
      totalBookings: this.bookings.length,
      bookingsByUser: this.users
        .sort((a, b) => a.id - b.id)
        .map((user) => ({
          user,
          bookingCount: this.bookings.filter((booking) => booking.userId === user.id).length
        }))
    };
  }

  private withUser(booking: Booking): BookingWithUser | null {
    const user = this.users.find((item) => item.id === booking.userId);
    return user ? { ...booking, user } : null;
  }
}
