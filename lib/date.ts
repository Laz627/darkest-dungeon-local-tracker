export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
export function shiftDate(date: string, offset: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}
export function getMonthKeyFromDate(date: string): string {
  return date.slice(0, 7); // YYYY-MM
}
export function getWeekStart(date: string): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}