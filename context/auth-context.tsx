"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

// Define types
type User = {
  id: string;
  email: string;
  role: "employee" | "employer";
  name?: string;
  nationalId?: string;
  city?: string;
  bio?: string;
  experienceLevel?: "junior" | "mid" | "senior";
  companyName?: string;
};

type SignupData = {
  email: string;
  password: string;
  role: string;
  name: string;
  nationalId?: string;
  city?: string;
  bio?: string;
  experienceLevel?: string;
  companyName?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
};

type LoginResponse = {
  accessToken: string;
  data: any;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL - replace with your actual API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          // Set default auth header
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Fetch user data
          const response = await axios.get<LoginResponse>(
            `${API_URL}/users/me`
          );
          setUser(response.data.data);
          console.log(user);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("accessToken");
        axios.defaults.headers.common["Authorization"] = "";
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post<LoginResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      const { accessToken, data } = response.data;

      // Save token and set default header
      localStorage.setItem("accessToken", accessToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      setUser(data.user);
      return data.user;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
      });
      // console.error("Login error:", error);
      // throw error;
    }
  };

  // Signup function
  const signup = async (data: SignupData) => {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/auth/signup`,
        data,
        { withCredentials: true }
      );
      const { accessToken, data: userData } = response.data;

      // Save token and set default header
      localStorage.setItem("accessToken", accessToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      setUser(userData.user);
      return userData.user;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear token and user data regardless of API response
      localStorage.removeItem("accessToken");
      axios.defaults.headers.common["Authorization"] = "";
      setUser(null);
      toast({
        title: "Logged out successfully",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
