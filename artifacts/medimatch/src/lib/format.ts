// Date and status helpers shared by the MediMATCH workspaces.
// All appointment times are scheduled and displayed in UTC.

export function isoDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
}

export function isWeekend(key: string) {
  const weekday = new Date(`${key}T00:00:00Z`).getUTCDay();
  return weekday === 0 || weekday === 6;
}

export function initialCareDate() {
  const cursor = new Date();
  for (let index = 0; index < 7; index += 1) {
    const key = isoDateKey(cursor);
    if (!isWeekend(key)) return key;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return isoDateKey(new Date());
}

export function formatDay(key: string) {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatTime(value: string | Date) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function formatShortDate(value: string | Date) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatMonthDay(value: string | Date) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatLongDate(value: string | Date) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatFullDate(value: string | Date) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function statusLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function statusTone(status: string) {
  if (status === "confirmed") return "confirmed";
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  if (status === "checked_in") return "checked-in";
  return "pending";
}

export function channelLabel(channel: string) {
  if (channel === "video") return "Video consultation";
  if (channel === "phone") return "Phone consultation";
  return "In-person appointment";
}

export function shortChannelLabel(channel: string) {
  if (channel === "video") return "Video";
  if (channel === "phone") return "Phone";
  return "In person";
}

export function providerInitials(name: string) {
  const initials = name
    .split(" ")
    .slice(1)
    .map((word) => word[0])
    .join("");
  return initials || name.slice(0, 1);
}

export function appointmentReference(id: number) {
  return `MM-A-${String(id).padStart(5, "0")}`;
}

export function patientReference(id: number) {
  return `MM-P-${String(id).padStart(5, "0")}`;
}

export const appointmentStatuses = [
  "pending",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
] as const;

export type AppointmentStatusValue = (typeof appointmentStatuses)[number];
