import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { GqlRequestError } from '../lib/graphql-client';
import {
  loginMutation,
  createUserMutation,
  meQuery,
  type CreateUserInput,
  type CurrentUser,
} from '../lib/graphql/users';
import { clearToken, readToken, writeToken } from '../lib/token-storage';
import { errorMessage } from '../lib/error-message';

interface AuthContextValue {
  token: string | null;
  user: CurrentUser | null;
  isLoading: boolean;
  // Set when a stored token could not be verified for a reason other than it being invalid (e.g.
  // the API is down) - the token is kept so a reload can recover, but there is no user.
  error: string | undefined;
  login: (email: string, password: string) => Promise<void>;
  register: (input: CreateUserInput) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isUnauthorized(error: unknown): boolean {
  return error instanceof GqlRequestError && error.status === 401;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken);
  const [user, setUser] = useState<CurrentUser | null>(null);
  // Only a token found in storage at startup needs verifying - login() receives the user directly.
  const [isLoading, setIsLoading] = useState(() => token !== null);
  const [error, setError] = useState<string | undefined>(undefined);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
    setError(undefined);
  }, []);

  const loadStoredUser = useEffectEvent(() => {
    if (!token) return undefined;

    let cancelled = false;
    async function load(storedToken: string) {
      try {
        const me = await meQuery(storedToken);
        if (!cancelled) setUser(me);
      } catch (loadError: unknown) {
        if (cancelled) return;
        if (isUnauthorized(loadError)) {
          logout();
        } else {
          setError(errorMessage(loadError, 'Could not load your account.'));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load(token);

    return () => {
      cancelled = true;
    };
  });

  // Once per app load. Later token changes come from login()/logout(), which set the user
  // themselves, so re-running here would only repeat the `me` request and flash the loading state.
  useEffect(() => loadStoredUser(), []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user: loggedInUser } = await loginMutation(email, password);
    writeToken(accessToken);
    setToken(accessToken);
    setUser(loggedInUser);
    setError(undefined);
  }, []);

  const register = useCallback(
    async (input: CreateUserInput) => {
      await createUserMutation(input);
      await login(input.email, input.password);
    },
    [login],
  );

  const refetchUser = useCallback(async () => {
    if (!token) return;
    try {
      setUser(await meQuery(token));
    } catch (refetchError) {
      if (isUnauthorized(refetchError)) {
        logout();
        return;
      }
      throw refetchError;
    }
  }, [token, logout]);

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      error,
      login,
      register,
      logout,
      refetchUser,
    }),
    [token, user, isLoading, error, login, register, logout, refetchUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
