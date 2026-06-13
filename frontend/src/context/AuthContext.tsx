import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';
import { isAuthenticated } from '../api/token';
import { setSessionExpiredHandler } from '../api/http';

interface AuthContextType {
  isAuthed: boolean;
  username: string | null;
  nickname: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthed, setIsAuthed] = useState<boolean>(() => isAuthenticated());
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('rf_username'));
  const [nickname, setNickname] = useState<string | null>(() => localStorage.getItem('rf_nickname'));

  // The HTTP layer calls this when a refresh fails — drop the session in the UI.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setIsAuthed(false);
      setUsername(null);
      setNickname(null);
      localStorage.removeItem('rf_username');
      localStorage.removeItem('rf_nickname');
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  const persist = (uname: string, nick: string | null) => {
    setIsAuthed(true);
    setUsername(uname);
    setNickname(nick);
    localStorage.setItem('rf_username', uname);
    if (nick) localStorage.setItem('rf_nickname', nick);
    else localStorage.removeItem('rf_nickname');
  };

  const login = async (uname: string, password: string) => {
    await authApi.login(uname, password);
    persist(uname, localStorage.getItem('rf_nickname'));
  };

  const signup = async (uname: string, password: string, nick: string) => {
    await authApi.signup(uname, password, nick);
    // Auto-login right after a successful signup.
    await authApi.login(uname, password);
    persist(uname, nick);
  };

  const logout = () => {
    authApi.logout();
    setIsAuthed(false);
    setUsername(null);
    setNickname(null);
    localStorage.removeItem('rf_username');
    localStorage.removeItem('rf_nickname');
  };

  return (
    <AuthContext.Provider value={{ isAuthed, username, nickname, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
