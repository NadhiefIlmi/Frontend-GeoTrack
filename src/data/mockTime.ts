/** Shared time helper so mock data and store produce consistent ISO strings. */
export function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}
