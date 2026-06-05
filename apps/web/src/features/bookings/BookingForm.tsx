import { LoaderCircle, Plus } from "lucide-react";
import type { FormEvent } from "react";
import type { BookingFormState } from "../../types/domain";

type BookingFormProps = {
  form: BookingFormState;
  submitting: boolean;
  className?: string;
  onSubmit: (event: FormEvent) => void;
  onChange: (form: BookingFormState) => void;
};

export function BookingForm({
  form,
  submitting,
  className = "stack-form",
  onSubmit,
  onChange
}: BookingFormProps) {
  return (
    <form className={className} onSubmit={onSubmit}>
      <div className="field-block">
        <label>Start Time (UTC)</label>
        <div className="date-time-row">
          <input
            type="date"
            value={form.startDate}
            onChange={(event) => onChange({ ...form, startDate: event.target.value })}
            required
          />
          <input
            type="time"
            value={form.startTime}
            onChange={(event) => onChange({ ...form, startTime: event.target.value })}
            required
          />
        </div>
      </div>

      <div className="field-block">
        <label>End Time (UTC)</label>
        <div className="date-time-row">
          <input
            type="date"
            value={form.endDate}
            onChange={(event) => onChange({ ...form, endDate: event.target.value })}
            required
          />
          <input
            type="time"
            value={form.endTime}
            onChange={(event) => onChange({ ...form, endTime: event.target.value })}
            required
          />
        </div>
      </div>

      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? <LoaderCircle className="loading-icon" size={22} /> : <Plus size={22} />}
        {submitting ? "Creating..." : "Create Booking"}
      </button>
    </form>
  );
}
