const NOTIFICATIONS_KEY = "untamedNotifications";

export interface Notification {
  id: string;
  type: "booking" | "cancellation" | "reminder" | "system";
  message: string;
  createdAt: string;
  read?: boolean;
}

export function addNotification(note: Omit<Notification, "id" | "createdAt">): void {
  const notes: Notification[] = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || "[]");
  notes.push({
    ...note,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    read: false,
  });
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notes));
}

export function getNotifications(): Notification[] {
  return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || "[]");
}

export function markAllRead(): void {
  const notes = getNotifications().map((n) => ({ ...n, read: true }));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notes));
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

export function clearNotifications(): void {
  localStorage.removeItem(NOTIFICATIONS_KEY);
}
