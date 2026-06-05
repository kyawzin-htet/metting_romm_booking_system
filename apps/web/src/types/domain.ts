export type Role = "admin" | "owner" | "user";
export type Tab = "bookings" | "analytics" | "users";

export type User = {
  id: number;
  name: string;
  role: Role;
  createdAt: string;
};

export type Booking = {
  id: number;
  userId: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  user: User;
};

export type Summary = {
  totalBookings: number;
  bookingsByUser: Array<{
    user: User;
    bookingCount: number;
  }>;
};

export type ApiError = {
  error?: {
    message?: string;
    details?: Array<{ path: string; message: string }>;
  };
};

export type BookingFormState = {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

export type NewUserFormState = {
  name: string;
  role: Role;
};

export type SummaryRow = {
  user: User;
  bookingCount: number;
};
