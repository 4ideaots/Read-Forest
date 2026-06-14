import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';
import { getMe } from '../api/user';
import { isAuthenticated } from '../api/token';
import { setSessionExpiredHandler } from '../api/http';

interface AuthContextType {
  isAuthed: boolean;
  userId: number | null;
  username: string | null;
  nickname: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
  refreshIdentity: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthed, setIsAuthed] = useState<boolean>(() => isAuthenticated());
  const [userId, setUserId] = useState<number | null>(() => {
    const raw = localStorage.getItem('rf_userId');
    return raw ? Number(raw) : null;
  });
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('rf_username'));
  const [nickname, setNickname] = useState<string | null>(() => localStorage.getItem('rf_nickname'));

  const clearIdentity = () => {
    setIsAuthed(false);
    setUserId(null);
    setUsername(null);
    setNickname(null);
    localStorage.removeItem('rf_userId');
    localStorage.removeItem('rf_username');
    localStorage.removeItem('rf_nickname');
  };

  // The HTTP layer calls this when a refresh fails — drop the session in the UI.
  useEffect(() => {
    setSessionExpiredHandler(() => clearIdentity());
    return () => setSessionExpiredHandler(null);
  }, []);

  // Pull the authenticated user's real identity (id + nickname) from the backend.
  const syncIdentity = async () => {
    try {
      const me = await getMe();
      setUserId(me.id);
      setUsername(me.username);
      setNickname(me.nickname);
      localStorage.setItem('rf_userId', String(me.id));
      localStorage.setItem('rf_username', me.username);
      localStorage.setItem('rf_nickname', me.nickname);
    } catch {
      // backend unreachable — keep locally cached identity
    }
  };

  // On mount, if a token is already present, confirm/refresh identity.
  useEffect(() => {
    if (isAuthenticated()) void syncIdentity();
  }, []);

  const persist = (uname: string, nick: string | null) => {
    setIsAuthed(true);
    setUsername(uname);
    setNickname(nick);
    localStorage.setItem('rf_username', uname);
    if (nick) localStorage.setItem('rf_nickname', nick);
  };

  const login = async (uname: string, password: string) => {
    await authApi.login(uname, password);
    persist(uname, localStorage.getItem('rf_nickname'));
    await syncIdentity();
  };

  const signup = async (uname: string, password: string, nick: string) => {
    await authApi.signup(uname, password, nick);
    // Auto-login right after a successful signup.
    await authApi.login(uname, password);
    persist(uname, nick);
    await syncIdentity();
  };

  const logout = () => {
    authApi.logout();
    clearIdentity();
  };

  return (
    <AuthContext.Provider value={{ isAuthed, userId, username, nickname, login, signup, logout, refreshIdentity: syncIdentity }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
