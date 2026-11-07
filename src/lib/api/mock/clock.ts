/** Relative timestamps so the demo always feels current. */
export function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

export function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 3_600_000).toISOString();
}

export function wait(ms = 640) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
