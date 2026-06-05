import { Clock3, Trash2 } from "lucide-react";
import type { Booking, User } from "../../types/domain";

type BookingListProps = {
  bookings: Booking[];
  currentUser: User;
  formatBookingTime: (value: string) => string;
  getInitials: (name: string) => string;
  canDeleteBooking: (user: User, booking: Booking) => boolean;
  onDeleteBooking: (id: number) => void;
};

export function BookingList({
  bookings,
  currentUser,
  formatBookingTime,
  getInitials,
  canDeleteBooking,
  onDeleteBooking
}: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="empty-bookings">
        <div className="empty-icon">
          <Clock3 size={34} />
        </div>
        <h2>No bookings scheduled</h2>
        <p>Create your first booking to get started</p>
      </div>
    );
  }

  return (
    <div className="booking-list">
      {bookings.map((booking) => (
        <article className="booking-row" key={booking.id}>
          <div className="avatar">{getInitials(booking.user.name)}</div>
          <div>
            <h3>{booking.user.name}</h3>
            <p>
              {formatBookingTime(booking.startTime)} to {formatBookingTime(booking.endTime)}
            </p>
          </div>
          {canDeleteBooking(currentUser, booking) && (
            <button
              className="icon-button"
              type="button"
              aria-label="Delete booking"
              onClick={() => onDeleteBooking(booking.id)}
            >
              <Trash2 size={21} />
            </button>
          )}
        </article>
      ))}
    </div>
  );
}
