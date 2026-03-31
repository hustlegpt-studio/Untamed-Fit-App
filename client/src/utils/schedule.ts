const SESSIONS_KEY = "untamedSessions";

export interface Session {
  id: string;
  trainee: string;
  date: string;
  time: string;
  duration: string;
  type: string;
  notes?: string;
  status: "booked" | "cancelled" | "completed";
  createdAt: string;
}

export function getSessions(): Session[] {
  return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
}

export function saveSession(session: Session): void {
  const sessions = getSessions();
  const existing = sessions.findIndex((s) => s.id === session.id);
  if (existing >= 0) {
    sessions[existing] = session;
  } else {
    sessions.push(session);
  }
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function cancelSession(id: string): void {
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx >= 0) {
    sessions[idx].status = "cancelled";
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }
}

export function getSessionsForDate(date: string): Session[] {
  return getSessions().filter((s) => s.date === date && s.status !== "cancelled");
}

export function getSessionsForTrainee(email: string): Session[] {
  return getSessions().filter((s) => s.trainee === email && s.status !== "cancelled");
}

export function isDateFullyBooked(date: string): boolean {
  const sessions = getSessionsForDate(date);
  return sessions.length >= 8;
}

export const AVAILABLE_TIMES = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM",
  "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM",
  "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM",
];

export const TRAINING_TYPES = [
  "Strength Training",
  "HIIT Cardio",
  "Military Bootcamp",
  "Mobility & Recovery",
  "Body Composition",
  "Endurance Training",
  "1-on-1 Coaching",
];

export const DURATIONS = ["30 min", "45 min", "60 min", "90 min"];

export function getBookedTimesForDate(date: string): string[] {
  return getSessionsForDate(date).map((s) => s.time);
}

export function canCancelSession(sessionDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const session = new Date(sessionDate);
  session.setHours(0, 0, 0, 0);
  const diffDays = (session.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 2;
}
