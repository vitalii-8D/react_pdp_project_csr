import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { GqlRequestError } from '../lib/graphql-client';
import { loginMutation, createUserMutation, meQuery, type CreateUserInput } from '../lib/graphql/users';
import type { UserEntity } from '../lib/types';

const TOKEN_STORAGE_KEY = 'token';

interface AuthContextValue {
  token: string | null;
  user: UserEntity | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: CreateUserInput) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState<UserEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async (currentToken: string) => {
    try {
      const me = await meQuery(currentToken);
      setUser(me);
    } catch (error) {
      if (error instanceof GqlRequestError && error.status === 401) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
        return;
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    loadUser(token).finally(() => setIsLoading(false));
  }, [token, loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user: loggedInUser } = await loginMutation(email, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    setUser(loggedInUser);
    setToken(accessToken);
  }, []);

  const register = useCallback(
    async (input: CreateUserInput) => {
      await createUserMutation(input);
      await login(input.email, input.password);
    },
    [login],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refetchUser = useCallback(async () => {
    if (token) {
      await loadUser(token);
    }
  }, [token, loadUser]);

  const value = useMemo(
    () => ({ token, user, isLoading, login, register, logout, refetchUser }),
    [token, user, isLoading, login, register, logout, refetchUser],
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
