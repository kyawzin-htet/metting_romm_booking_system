import { Calendar, Clock3 } from "lucide-react";
import type { FormEvent } from "react";
import { MobileActionCard } from "../../components/ui/MobileActionCard";
import { ModalPanel } from "../../components/ui/ModalPanel";
import { PanelTitle } from "../../components/ui/PanelTitle";
import type { Booking, BookingFormState, User } from "../../types/domain";
import { formatUtc } from "../../utils/date";
import { canDeleteBooking } from "../../utils/permissions";
import { initials } from "../../utils/user";
import { BookingForm } from "./BookingForm";
import { BookingList } from "./BookingList";

type BookingsViewProps = {
  currentUser: User;
  bookings: Booking[];
  bookingForm: BookingFormState;
  bookingDialogOpen: boolean;
  bookingSubmitting: boolean;
  onOpenBookingDialog: () => void;
  onCloseBookingDialog: () => void;
  onCreateBooking: (event: FormEvent) => void;
  onBookingFormChange: (form: BookingFormState) => void;
  onDeleteBooking: (id: number) => void;
};

export function BookingsView({
  currentUser,
  bookings,
  bookingForm,
  bookingDialogOpen,
  bookingSubmitting,
  onOpenBookingDialog,
  onCloseBookingDialog,
  onCreateBooking,
  onBookingFormChange,
  onDeleteBooking
}: BookingsViewProps) {
  return (
    <div className="booking-grid">
      <MobileActionCard
        className="mobile-booking-trigger"
        icon={<Clock3 size={24} />}
        title="New Booking"
        description="Reserve the meeting room"
        onClick={onOpenBookingDialog}
      />

      <section className="panel booking-create-panel">
        <PanelTitle
          icon={<Clock3 size={28} />}
          title="New Booking"
          description="Reserve the meeting room"
        />
        <BookingForm
          form={bookingForm}
          submitting={bookingSubmitting}
          onSubmit={onCreateBooking}
          onChange={onBookingFormChange}
        />
        <p className="panel-footnote">Back-to-back bookings are allowed</p>
      </section>

      <section className="panel scheduled-panel">
        <div className="panel-bar">
          <PanelTitle
            icon={<Calendar size={28} />}
            title="Scheduled Bookings"
            description="Upcoming room reservations"
          />
          <span className="count-pill">{bookings.length} total</span>
        </div>

        <BookingList
          bookings={bookings}
          currentUser={currentUser}
          formatBookingTime={formatUtc}
          getInitials={initials}
          canDeleteBooking={canDeleteBooking}
          onDeleteBooking={onDeleteBooking}
        />
      </section>

      {bookingDialogOpen && (
        <ModalPanel
          ariaLabel="New Booking"
          className="form-dialog"
          icon={<Clock3 size={28} />}
          title="New Booking"
          description="Reserve the meeting room"
          closeLabel="Close booking dialog"
          onClose={onCloseBookingDialog}
        >
          <BookingForm
            className="stack-form dialog-form"
            form={bookingForm}
            submitting={bookingSubmitting}
            onSubmit={onCreateBooking}
            onChange={onBookingFormChange}
          />
          <p className="panel-footnote dialog-footnote">Back-to-back bookings are allowed</p>
        </ModalPanel>
      )}
    </div>
  );
}
