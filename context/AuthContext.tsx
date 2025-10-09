'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import CryptoJS from 'crypto-js';

interface UserData {
  login: string;
  senha: string;
  cnp: string;
  nome: string;
  adm: boolean;
}

interface AuthContextType {
  user: UserData | null;
  loginUser: (userData: UserData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SECRET_KEY = 'crvr_app_2025_secret'; // 🔒 muda conforme o ambiente

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      try {
        const bytes = CryptoJS.AES.decrypt(stored, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        const parsed = JSON.parse(decrypted);
        setUser(parsed);
      } catch {
        console.warn('Falha ao descriptografar usuário, limpando storage');
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  const loginUser = (userData: UserData) => {
    setUser(userData);
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(userData),
      SECRET_KEY
    ).toString();
    localStorage.setItem('authUser', encrypted);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
