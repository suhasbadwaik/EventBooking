export function toLocalDateTimeString(d: Date) {
  // Backend expects LocalDateTime (no timezone). We'll send as "YYYY-MM-DDTHH:mm:ss"
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
}

export function fromIsoLike(s: string) {
  // backend returns "2026-01-29T10:00:00" (LocalDateTime) or with offset.
  // new Date() handles offset; for localdatetime it treats as local in most browsers.
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

