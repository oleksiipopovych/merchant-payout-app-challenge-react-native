const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats an ISO timestamp as "DD Mon YYYY" in the device's time zone, e.g. "23 Jan 2026".
 * Month names are fixed rather than taken from Intl, whose short months differ between
 * JS engines ("Sep" vs "Sept").
 */
export function formatActivityDate(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, '0');
  return `${day} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
