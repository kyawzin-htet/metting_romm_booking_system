import { BarChart3 } from "lucide-react";
import { PanelTitle } from "../../components/ui/PanelTitle";
import type { SummaryRow } from "../../types/domain";
import { initials } from "../../utils/user";

type AnalyticsViewProps = {
  totalBookings: number;
  summaryRows: SummaryRow[];
  maxBookingCount: number;
};

export function AnalyticsView({
  totalBookings,
  summaryRows,
  maxBookingCount
}: AnalyticsViewProps) {
  return (
    <section className="panel analytics-panel">
      <div className="analytics-header">
        <PanelTitle
          icon={<BarChart3 size={28} />}
          title="Usage Analytics"
          description="Booking distribution by user"
        />
        <div className="total-block">
          <strong>{totalBookings}</strong>
          <span>Total bookings</span>
        </div>
      </div>

      <div className="analytics-list">
        {summaryRows.map((item) => (
          <article className="analytics-row" key={item.user.id}>
            <div className="analytics-row-main">
              <div className="avatar">{initials(item.user.name)}</div>
              <h3>{item.user.name}</h3>
              <strong>{item.bookingCount}</strong>
            </div>
            <div className="meter">
              <span
                style={{
                  width: `${Math.max(0, (item.bookingCount / maxBookingCount) * 100)}%`
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
