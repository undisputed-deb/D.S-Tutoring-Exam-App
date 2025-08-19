import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateSession, createSecureSession } from '../utils/security';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  userId: string | null;
  login: (role: string, userId: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount and when visibility changes
    const checkSession = () => {
      console.log('Checking session...');
      
      // Check multiple storage locations for session data
      const session = sessionStorage.getItem('secure_session') || 
                     localStorage.getItem('backup_session');
      const storedRole = sessionStorage.getItem('userRole') || 
                        localStorage.getItem('userRole');
      const storedUserId = sessionStorage.getItem('userId') || 
                          localStorage.getItem('userId') ||
                          sessionStorage.getItem('currentStudentId');
      
      if (session && storedRole && storedUserId) {
        if (validateSession(session)) {
          console.log('Valid session found, restoring auth state');
          setIsAuthenticated(true);
          setUserRole(storedRole);
          setUserId(storedUserId);
          
          // Ensure backup exists
          localStorage.setItem('backup_session', session);
          localStorage.setItem('userRole', storedRole);
          localStorage.setItem('userId', storedUserId);
        } else {
          console.log('Invalid session, clearing auth');
          clearAuthData();
        }
      } else {
        console.log('No session found');
        clearAuthData();
      }
      
      setIsLoading(false);
    };

    // Initial check
    checkSession();

    // Check when page becomes visible again (handles screen wake)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, checking session...');
        checkSession();
      }
    };

    // Check when page gains focus (handles alt-tab)
    const handleFocus = () => {
      console.log('Page gained focus, checking session...');
      checkSession();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const clearAuthData = () => {
    sessionStorage.removeItem('secure_session');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('currentStudentId');
    localStorage.removeItem('backup_session');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
  };

  const login = (role: string, userIdParam: string) => {
    console.log('Logging in:', { role, userIdParam });
    
    const session = createSecureSession(userIdParam);
    
    // Store in multiple locations for redundancy
    sessionStorage.setItem('secure_session', session);
    sessionStorage.setItem('userRole', role);
    sessionStorage.setItem('userId', userIdParam);
    
    // Backup to localStorage
    localStorage.setItem('backup_session', session);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userId', userIdParam);
    
    // For students, also store as currentStudentId
    if (role === 'student') {
      sessionStorage.setItem('currentStudentId', userIdParam);
    }
    
    setIsAuthenticated(true);
    setUserRole(role);
    setUserId(userIdParam);
  };

  const logout = () => {
    console.log('Logging out...');
    clearAuthData();
    
    // Clear quiz-related data
    localStorage.removeItem('studentQuizzes');
    localStorage.removeItem('studentData');
    localStorage.removeItem('quizResults');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      userId, 
      login, 
      logout, 
      isLoading 
    }}>
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