import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout in milliseconds (10 minutes)
const SESSION_TIMEOUT = 10 * 60 * 1000;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);

  // Load user from localStorage on first render
  useEffect(() => {
    setIsInitializing(true);
    const storedUser = localStorage.getItem('user');
    const lastActivity = localStorage.getItem('lastActivity');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const now = Date.now();
        const lastActivityTime = lastActivity ? parseInt(lastActivity) : now;
        
        // Check if session has expired
        if (now - lastActivityTime > SESSION_TIMEOUT) {
          localStorage.removeItem('user');
          localStorage.removeItem('lastActivity');
        } else {
          setUser(userData);
          startSessionTimer();
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivity');
      }
    }
    setIsInitializing(false);
  }, []);

  // Start session timer
  const startSessionTimer = () => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    
    const timer = setTimeout(() => {
      logout();
      alert('Session expired. Please login again.');
    }, SESSION_TIMEOUT);
    
    setSessionTimer(timer);
  };

  // Reset session timer on user activity
  const resetSessionTimer = () => {
    if (user) {
      localStorage.setItem('lastActivity', Date.now().toString());
      startSessionTimer();
    }
  };

  // Add event listeners for user activity
  useEffect(() => {
    if (user) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      events.forEach(event => {
        document.addEventListener(event, resetSessionTimer, true);
      });
      
      return () => {
        events.forEach(event => {
          document.removeEventListener(event, resetSessionTimer, true);
        });
      };
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === 'gokulsvsv@gmail.com' && password === 'password123') {
      const mockUser: User = {
        id: '1',
        email,
        name: 'Gokul S',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser)); // ✅ Save to localStorage
      localStorage.setItem('lastActivity', Date.now().toString());
      startSessionTimer();
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // ✅ Clear localStorage on logout
    localStorage.removeItem('lastActivity');
    if (sessionTimer) {
      clearTimeout(sessionTimer);
      setSessionTimer(null);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, verify current password with backend
    if (currentPassword === 'password123') {
      // Update password in localStorage (in real app, this would be on backend)
      const storedUser = localStorage.getItem('user');
      if (storedUser && user) {
        // In real app, password would be updated on server
        // Here we just simulate success
        return true;
      }
    }
    return false;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    changePassword,
    isLoading,
    isInitializing
  };

  // Show loading spinner while checking authentication
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
