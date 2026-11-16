/**
 * Minimal, standards-aligned cookie helpers.
 * Only used by the storefront for consent persistence — auth sessions stay on
 * HttpOnly cookies managed by the API and access tokens stay in memory.
 */

export type CookieSerializeOptions = {
  days?: number;
  path?: string;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
};

const isBrowser = () => typeof document !== "undefined";

export function setCookie(name: string, value: string, options: CookieSerializeOptions = {}): void {
  if (!isBrowser()) return;

  const { days = 365, path = "/", sameSite = "lax", secure } = options;
  const maxAge = Math.floor(days * 24 * 60 * 60);
  const secureFlag = secure ?? window.location.protocol === "https:";

  document.cookie = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `Max-Age=${maxAge}`,
    `Path=${path}`,
    `SameSite=${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1)}`,
    secureFlag ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function getCookie(name: string): string | null {
  if (!isBrowser()) return null;

  const key = `${encodeURIComponent(name)}=`;
  for (const part of document.cookie.split(";")) {
    const cookie = part.trim();
    if (cookie.startsWith(key)) {
      return decodeURIComponent(cookie.slice(key.length));
    }
  }
  return null;
}

export function removeCookie(name: string, path = "/"): void {
  if (!isBrowser()) return;
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=${path}`;
}
