// Versioned key so a future change to the auth format (e.g. refresh tokens) can migrate or drop old
// entries. Every access is wrapped: storage throws in some private-browsing modes, when disabled,
// or when the quota is exceeded - and a throw here would take down the AuthProvider, which sits
// above the app's ErrorBoundary.
const TOKEN_STORAGE_KEY = 'auth:v1:token';
const LEGACY_TOKEN_STORAGE_KEY = 'token';

export function readToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) return token;

    const legacyToken = localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY);
    if (legacyToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, legacyToken);
      localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    }
    return legacyToken;
  } catch {
    return null;
  }
}

export function writeToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Not persisted - the session still works until the tab is closed.
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
