import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthContextType } from "../types";
import { apiService } from "../services/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout in milliseconds (10 minutes)
const SESSION_TIMEOUT = 60 * 60 * 1000;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
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
  const [sessionTimer, setSessionTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Load user from localStorage on first render
  useEffect(() => {
    setIsInitializing(true);
    const storedUser = localStorage.getItem("user");
    const lastActivity = localStorage.getItem("lastActivity");

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const now = Date.now();
        const lastActivityTime = lastActivity ? parseInt(lastActivity) : now;

        // Check if session has expired
        if (now - lastActivityTime > SESSION_TIMEOUT) {
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("lastActivity");
        } else {
          setUser(userData);
          startSessionTimer();
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("lastActivity");
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
      alert("Session expired. Please login again.");
    }, SESSION_TIMEOUT);

    setSessionTimer(timer);
  };

  // Reset session timer on user activity
  const resetSessionTimer = () => {
    if (user) {
      localStorage.setItem("lastActivity", Date.now().toString());
      startSessionTimer();
    }
  };

  // Add event listeners for user activity
  useEffect(() => {
    if (user) {
      const events = [
        "mousedown",
        "mousemove",
        "keypress",
        "scroll",
        "touchstart",
        "click",
      ];

      events.forEach((event) => {
        document.addEventListener(event, resetSessionTimer, true);
      });

      return () => {
        events.forEach((event) => {
          document.removeEventListener(event, resetSessionTimer, true);
        });
      };
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await apiService.login(email, password);
      console.log("Login response:", response);
      if (response.success && response.data && response.data.user) {
        const userData: User = {
          _id: response.data.user._id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("lastActivity", Date.now().toString());
        startSessionTimer();
        setIsLoading(false);
        return true;
      } else {
        const errorMessage = response.error || "Login failed";
        console.error(errorMessage);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    try {
      const response = await apiService.logout();
      console.log("Logout response:", response);
      if (response.success) {
        localStorage.removeItem("user"); // Clear user data from localStorage
        localStorage.removeItem("accessToken"); // Clear access token
        localStorage.removeItem("refreshToken"); // Clear refresh token
        localStorage.removeItem("lastActivity"); // Clear last activity timestamp

        if (sessionTimer) {
          clearTimeout(sessionTimer); // Clear session timer
          setSessionTimer(null);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
    setIsLoading(false);
    return true;
  };

  // Auto-refresh token when it expires
  useEffect(() => {
    const refreshTokenInterval = setInterval(async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      const accessToken = localStorage.getItem("accessToken");
      // console.log("refreshToken",  refreshToken,"accessToken", accessToken);
      if (refreshToken && accessToken) {
        const response = await apiService.refreshToken();
        if (response.success && response.data) {
          localStorage.setItem("accessToken", response.data.accessToken);
          localStorage.setItem("refreshToken", response.data.refreshToken);
          resetSessionTimer(); // Reset session timer on successful token refresh
        } else {
          console.error("Failed to refresh token:", response.error);
        }
      }
    }, 0.2 * 60 * 1000); // Refresh token every 15 minutes
    return () => clearInterval(refreshTokenInterval);
  });

  const changePassword = async (
    email: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      localStorage.setItem("email", email);
      localStorage.setItem("currentPassword", currentPassword);
      localStorage.setItem("newPassword", newPassword);
      const response = await apiService.changePassword( );
      console.log("Change password response:", response);
      if (response.success) {
        setIsLoading(false);
        return true;
      } else {
        const errorMessage = response.error || "Change password failed";
        console.error(errorMessage);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Change password error:", error);
      setIsLoading(false);
      return false;
    }
  };

  // const changePassword = async (
  //   currentPassword: string,
  //   newPassword: string
  // ): Promise<boolean> => {
  //   // Simulate API call
  //   await new Promise((resolve) => setTimeout(resolve, 1000));

  //   // In a real app, verify current password with backend
  //   if (currentPassword === "password123") {
  //     // Update password in localStorage (in real app, this would be on backend)
  //     const storedUser = localStorage.getItem("user");
  //     if (storedUser && user) {
  //       // In real app, password would be updated on server
  //       // Here we just simulate success
  //       return true;
  //     }
  //   }
  //   return false;
  // };

  const value: AuthContextType = {
    user,
    setUser,
    login,
    logout,
    changePassword,
    isLoading,
    isInitializing,
  };

  // Show loading spinner while checking authentication
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};