// Where the session tokens live.
//
// The site and the API are served from different domains, so a cookie the API sets is a
// third-party cookie as far as the browser is concerned, and Safari, Firefox and Brave drop
// those by default — login would succeed and every request after it would come back 401.
// A Bearer token in the Authorization header is the one scheme that behaves identically in
// every browser cross-origin, so that is what the app uses.
//
// The trade-off, worth knowing: unlike an httpOnly cookie, this is readable by JavaScript, so
// an XSS hole anywhere on the site would expose a live session. The access token is short
// lived (JWT_ACCESS_TOKEN_TTL on the backend) to limit the window, and the refresh token is
// rotated on every use — but the real defence is never rendering untrusted HTML.
//
// `scope` keeps the storefront and the admin panel apart, so one browser can hold both a
// customer session and an admin session without them overwriting each other.

const memory = new Map();

function storageKey(scope, kind) {
  return `fcs:${scope}:${kind}`;
}

// localStorage throws in some private-browsing modes and when site data is blocked, so every
// access is guarded and falls back to an in-memory copy that lasts until the tab is closed.
function read(key) {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored !== null) return stored;
  } catch {
    /* fall through to memory */
  }
  return memory.get(key) ?? null;
}

function write(key, value) {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* memory-only session */
  }
}

function remove(key) {
  memory.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* nothing to clear */
  }
}

export function getTokens(scope) {
  return {
    accessToken: read(storageKey(scope, 'access')),
    refreshToken: read(storageKey(scope, 'refresh')),
  };
}

export function setTokens(scope, tokens) {
  if (!tokens) return;
  if (tokens.accessToken) write(storageKey(scope, 'access'), tokens.accessToken);
  if (tokens.refreshToken) write(storageKey(scope, 'refresh'), tokens.refreshToken);
}

export function clearTokens(scope) {
  remove(storageKey(scope, 'access'));
  remove(storageKey(scope, 'refresh'));
}
