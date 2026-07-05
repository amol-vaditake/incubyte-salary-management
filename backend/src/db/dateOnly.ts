// Normalizes a DATE column value to a plain 'YYYY-MM-DD' string, regardless
// of whether the driver returned a string (the real pg Pool, after the
// global type-parser override in pool.ts) or a Date object (pg-mem, which
// doesn't share that override - see AI_LOG.md). pg-mem's Date objects are
// UTC-midnight-anchored, so toISOString().slice(0, 10) recovers the correct
// calendar date independent of the machine's local timezone.
export function toDateOnlyString(value: string | Date): string {
  if (typeof value === "string") return value;
  return value.toISOString().slice(0, 10);
}
