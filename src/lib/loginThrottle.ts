// Client-side sign-in throttle. NOTE: this is best-effort UX protection only —
// real per-IP rate limiting requires backend infrastructure (not yet available on this stack).
const KEY = "buspay.loginAttempts";
const MAX = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCK_MS = 15 * 60 * 1000;

interface State {
  attempts: number[];
  lockedUntil: number | null;
}

function read(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { attempts: [], lockedUntil: null };
    return JSON.parse(raw) as State;
  } catch {
    return { attempts: [], lockedUntil: null };
  }
}

function write(s: State) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function getLockRemainingMs(): number {
  const s = read();
  if (!s.lockedUntil) return 0;
  const r = s.lockedUntil - Date.now();
  if (r <= 0) {
    write({ attempts: [], lockedUntil: null });
    return 0;
  }
  return r;
}

export function recordFailedAttempt(): { locked: boolean; remainingMs: number } {
  const now = Date.now();
  const s = read();
  if (s.lockedUntil && s.lockedUntil > now) {
    return { locked: true, remainingMs: s.lockedUntil - now };
  }
  // Drop attempts outside the window
  s.attempts = s.attempts.filter((t) => now - t < WINDOW_MS);
  s.attempts.push(now);
  if (s.attempts.length >= MAX) {
    s.lockedUntil = now + LOCK_MS;
    write(s);
    return { locked: true, remainingMs: LOCK_MS };
  }
  write(s);
  return { locked: false, remainingMs: 0 };
}

export function clearAttempts() {
  write({ attempts: [], lockedUntil: null });
}

export function attemptsRemaining(): number {
  const now = Date.now();
  const s = read();
  const recent = s.attempts.filter((t) => now - t < WINDOW_MS);
  return Math.max(0, MAX - recent.length);
}
