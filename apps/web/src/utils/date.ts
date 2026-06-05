export function formatUtc(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC"
  }).format(new Date(value));
}

export function toUtcIso(date: string, time: string) {
  if (!date || !time) {
    throw new Error("Start and end dates and times are required");
  }
  return `${date}T${time.length === 5 ? `${time}:00` : time}.000Z`;
}
