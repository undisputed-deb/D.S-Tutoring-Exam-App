
import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateSession, createSecureSession } from '../utils/security';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  login: (role: string, userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    const session = sessionStorage.getItem('secure_session');
    if (session && validateSession(session)) {
      setIsAuthenticated(true);
      setUserRole('teacher');
    } else {
      // Clear invalid session
      sessionStorage.removeItem('secure_session');
    }
  }, []);

  const login = (role: string, userId: string) => {
    const session = createSecureSession(userId);
    sessionStorage.setItem('secure_session', session);
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const logout = () => {
    sessionStorage.removeItem('secure_session');
    localStorage.removeItem('studentQuizzes');
    localStorage.removeItem('studentData');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
