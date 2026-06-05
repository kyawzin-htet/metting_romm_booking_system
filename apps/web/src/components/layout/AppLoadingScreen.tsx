import { CalendarDays, LoaderCircle } from "lucide-react";

export function AppLoadingScreen() {
  return (
    <main className="app-shell app-loading-shell" role="status" aria-live="polite">
      <section className="app-loader" aria-label="Loading application">
        <div className="app-loader-icon">
          <CalendarDays size={34} />
        </div>
        <div className="app-loader-copy">
          <h1>Meeting Room</h1>
          <p>Loading your workspace</p>
        </div>
        <LoaderCircle className="loading-icon app-loader-spinner" size={28} />
      </section>
    </main>
  );
}
