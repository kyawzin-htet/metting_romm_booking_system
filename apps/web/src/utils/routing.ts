import type { Tab } from "../types/domain";

export function tabFromHash(): Tab | null {
  const tab = window.location.hash.replace("#", "");
  return tab === "bookings" || tab === "analytics" || tab === "users" ? tab : null;
}
