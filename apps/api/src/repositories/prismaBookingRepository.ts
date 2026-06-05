import { PrismaClient } from "@prisma/client";
import type {
  BookingRepository,
  CreateBookingInput,
  CreateUserInput,
  UpdateUserInput
} from "./bookingRepository.js";
import type { Booking, BookingWithUser, UsageSummary, User } from "../domain/types.js";

export class PrismaBookingRepository implements BookingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  listUsers(): Promise<User[]> {
    return this.prisma.user.findMany({ orderBy: { id: "asc" } });
  }

  getUser(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  createUser(input: CreateUserInput): Promise<User> {
    return this.prisma.user.create({ data: input });
  }

  updateUser(id: number, input: UpdateUserInput): Promise<User | null> {
    return this.prisma.user
      .update({ where: { id }, data: input })
      .catch((error: { code?: string }) => {
        if (error.code === "P2025") {
          return null;
        }
        throw error;
      });
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch (error) {
      if ((error as { code?: string }).code === "P2025") {
        return false;
      }
      throw error;
    }
  }

  listBookings(): Promise<BookingWithUser[]> {
    return this.prisma.booking.findMany({
      include: { user: true },
      orderBy: [{ startTime: "asc" }, { id: "asc" }]
    });
  }

  getBooking(id: number): Promise<BookingWithUser | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      include: { user: true }
    });
  }

  async findOverlappingBooking(startTime: Date, endTime: Date): Promise<Booking | null> {
    return this.prisma.booking.findFirst({
      where: {
        startTime: { lt: endTime },
        endTime: { gt: startTime }
      },
      orderBy: { id: "asc" }
    });
  }

  createBooking(input: CreateBookingInput): Promise<BookingWithUser> {
    return this.prisma.booking.create({
      data: input,
      include: { user: true }
    });
  }

  async deleteBooking(id: number): Promise<boolean> {
    try {
      await this.prisma.booking.delete({ where: { id } });
      return true;
    } catch (error) {
      if ((error as { code?: string }).code === "P2025") {
        return false;
      }
      throw error;
    }
  }

  async getSummary(): Promise<UsageSummary> {
    const [totalBookings, users] = await Promise.all([
      this.prisma.booking.count(),
      this.prisma.user.findMany({
        orderBy: { id: "asc" },
        include: { _count: { select: { bookings: true } } }
      })
    ]);

    return {
      totalBookings,
      bookingsByUser: users.map(
        (record: User & { _count: { bookings: number } }) => ({
          user: {
            id: record.id,
            name: record.name,
            role: record.role,
            createdAt: record.createdAt
          },
          bookingCount: record._count.bookings
        })
      )
    };
  }
}
