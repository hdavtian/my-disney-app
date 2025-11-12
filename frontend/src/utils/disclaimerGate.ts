/**
 * Lightweight client-side gate for disclaimer acceptance.
 * Stores a flag in both localStorage and a cookie (180 days) so refreshes and subpaths are allowed.
 */

const COOKIE_NAME = "DISNEY_APP_DISCLAIMER";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days in seconds

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  try {
    document.cookie = `${name}=${value}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}

function getCookie(name: string): string | null {
  try {
    const match = document.cookie.match(
      new RegExp("(?:^|; )" + name + "=([^;]*)")
    );
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export function isDisclaimerAccepted(): boolean {
  // Prefer localStorage, fallback to cookie
  try {
    const ls = window.localStorage.getItem(COOKIE_NAME);
    if (ls === "1") return true;
  } catch {
    // ignore
  }
  const cookie = getCookie(COOKIE_NAME);
  return cookie === "1";
}

export function acceptDisclaimer(): void {
  try {
    window.localStorage.setItem(COOKIE_NAME, "1");
  } catch {
    // ignore
  }
  setCookie(COOKIE_NAME, "1", COOKIE_MAX_AGE);
}

export function clearDisclaimer(): void {
  try {
    window.localStorage.removeItem(COOKIE_NAME);
  } catch {
    // ignore
  }
  setCookie(COOKIE_NAME, "", 0);
}

export function buildRedirectParam(pathname: string, search: string): string {
  const target = pathname + (search || "");
  return encodeURIComponent(target || "/");
}
