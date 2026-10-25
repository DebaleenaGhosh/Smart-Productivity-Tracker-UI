// Decoding claims is for client-side session UX, not signature verification.
function decodeSession(token) {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part))) {
    return null;
  }

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
    const claims = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!claims || typeof claims !== "object" || Array.isArray(claims)) return null;
    const { sub, userId, role, exp } = claims;
    if (typeof exp !== "number" || !Number.isFinite(exp) ||
        !Number.isFinite(exp * 1000) || exp * 1000 <= Date.now()) return null;

    return {
      token,
      sub: typeof sub === "string" ? sub : null,
      userId: typeof userId === "string" ||
        (typeof userId === "number" && Number.isFinite(userId)) ? userId : null,
      role: typeof role === "string" ? role : null,
      exp,
      expiresAt: exp * 1000,
    };
  } catch {
    return null;
  }
}

export function getSession() {
  try {
    return decodeSession(window.localStorage.getItem("token"));
  } catch {
    return null;
  }
}

export function saveSession(token) {
  const session = decodeSession(token);
  if (!session) throw new Error("The server returned an invalid or expired session. Please log in again.");
  try {
    window.localStorage.removeItem("userRole");
    window.localStorage.setItem("token", token);
  } catch {
    throw new Error("Unable to save your session. Please allow browser storage and try again.");
  }
  window.dispatchEvent(new Event("session-changed"));
  return session;
}

export function clearSession() {
  try {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("userRole");
  } finally {
    window.dispatchEvent(new Event("session-changed"));
  }
}