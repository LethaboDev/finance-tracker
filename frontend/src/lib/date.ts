export function safeDate(raw: unknown): Date {
  if (Array.isArray(raw)) {
    const [y, m, d] = raw as number[];
    return new Date(y, m - 1, d);
  }
  const s = String(raw);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(s);
}

export function fmtDate(raw: unknown): string {
  const d = safeDate(raw);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}
