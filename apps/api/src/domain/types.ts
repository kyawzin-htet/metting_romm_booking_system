export const roles = ["admin", "owner", "user"] as const;

export type Role = (typeof roles)[number];

export type User = {
  id: number;
  name: string;
  role: Role;
  createdAt: Date;
};

export type Booking = {
  id: number;
  userId: number;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
};

export type BookingWithUser = Booking & {
  user: User;
};

export type UserBookingSummary = {
  user: User;
  bookingCount: number;
};

export type UsageSummary = {
  totalBookings: number;
  bookingsByUser: UserBookingSummary[];
};
