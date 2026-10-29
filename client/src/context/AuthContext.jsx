import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_STORAGE_KEY } from '../api/client';
import { authApi } from '../api/services';
import { readJSON, writeJSON } from '../utils/storage';

const AuthContext = createContext(null);

/**
 * Keeps track of who is logged in.
 * The token and user are saved in localStorage so a page refresh keeps you logged in.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readJSON(AUTH_STORAGE_KEY, null));
  const [checking, setChecking] = useState(Boolean(session?.token));

  const saveSession = useCallback((next) => {
    setSession(next);
    writeJSON(AUTH_STORAGE_KEY, next);
  }, []);

  const logout = useCallback(() => saveSession(null), [saveSession]);

  // On first load, confirm the saved token is still valid and refresh the user details.
  useEffect(() => {
    if (!session?.token) return;
    authApi
      .me()
      .then((user) => saveSession({ token: session.token, user }))
      .catch(() => logout())
      .finally(() => setChecking(false));
    // Run once on start-up only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The API client fires this event when the server rejects the token.
  useEffect(() => {
    window.addEventListener('shopez:unauthorized', logout);
    return () => window.removeEventListener('shopez:unauthorized', logout);
  }, [logout]);

  const login = useCallback(
    async (email, password) => {
      const result = await authApi.login(email, password);
      saveSession(result);
      return result.user;
    },
    [saveSession]
  );

  const register = useCallback(
    async (name, email, password) => {
      const result = await authApi.register(name, email, password);
      saveSession(result);
      return result.user;
    },
    [saveSession]
  );

  const value = useMemo(
    () => ({
      user: session?.user || null,
      isAdmin: session?.user?.role === 'admin',
      checking,
      login,
      register,
      logout,
    }),
    [session, checking, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
