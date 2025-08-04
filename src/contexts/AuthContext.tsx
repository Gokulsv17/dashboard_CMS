import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { apiService, LoginResponse } from '../services/api';

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
  const [error, setError] = useState('');
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
    setError('');

    try {
      console.log('🔐 Attempting login with:', { email });
      console.log('🔐 Password length:', password.length);
      console.log('🔐 API URL:', `${API_BASE_URL}/auth/login`);
      
      const response = await apiService.login(email, password);
      console.log('🔐 Login response:', response);
      
      if (response && response.success && response.data) {
        const userData: User = {
          id: response.data.user._id,
          email: response.data.user.email,
          name: response.data.user.name,
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('lastActivity', Date.now().toString());
        
        startSessionTimer();
        setIsLoading(false);
        console.log('🔐 Login successful, user data saved');
        return true;
      } else {
        const errorMessage = response?.message || 'Invalid email or password';
        console.error('🔐 Login failed:', errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('🔐 Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      // Check if it's a network error or API error
      if (error instanceof Error) {
        errorMessage = error.message.includes('Invalid') ? 
          'Invalid email or password' : 
          'Connection error. Please check your internet connection.';
      }
      
      setError(errorMessage);
    }

    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('lastActivity');
    
    if (sessionTimer) {
      clearTimeout(sessionTimer);
      setSessionTimer(null);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await apiService.changePassword({
        email: user?.email || '',
        currentPassword,
        newPassword
      });
      
      return response.success;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  };

  // Auto-refresh token when it expires
  useEffect(() => {
    const refreshTokenIfNeeded = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('accessToken');
      
      if (refreshToken && !accessToken && user) {
        try {
          const response = await apiService.refreshToken(refreshToken);
          if (response.success && response.data) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
          }
        } catch (error) {
          console.error('Token refresh error:', error);
          logout();
        }
      }
    };

    refreshTokenIfNeeded();
  }, [user]);

  const value: AuthContextType = {
    user,
    login,
    logout,
    changePassword,
    isLoading,
    isInitializing,
    error
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
