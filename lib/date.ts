export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function shiftDate(dateStr: string, deltaDays: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

export function getMonthKeyFromDate(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

export function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMonday);
  return d.toISOString().slice(0, 10);
}
