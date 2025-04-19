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
  login: (email: string, password: string) => Promise<any>;
  signup: (data: SignupData) => Promise<any>;
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
          const responseUser = response.data.data;
          setUser({
            id: responseUser.id,
            name:
              responseUser.employer?.name || responseUser.employee?.name || "",
            email: responseUser.email || "",
            nationalId: responseUser.employee?.nationalId || "",
            city: responseUser.employee?.city || "",
            bio: responseUser.employee?.bio || "",
            experienceLevel: responseUser.employee?.experienceLevel || "",
            companyName: responseUser.employer?.companyName || "",
            role: responseUser.role || "",
          });
        }
      } catch (error) {
        // console.error("Auth check error:", error);
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

      const userData = {
        id: data.user.id,
        name: data.user.employer?.name || data.user.employee?.name || "",
        email: data.user.email || "",
        nationalId: data.user.employee?.nationalId || "",
        city: data.user.employee?.city || "",
        bio: data.user.employee?.bio || "",
        experienceLevel: data.user.employee?.experienceLevel || "",
        companyName: data.user.employer?.companyName || "",
        role: data.user.role || "",
      };

      await setUser(userData);
      return userData;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
      });
    }
  };

  // Signup function
  const signup = async (signupData: SignupData) => {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/auth/signup`,
        signupData,
        { withCredentials: true }
      );
      const { accessToken, data } = response.data;

      // Save token and set default header
      localStorage.setItem("accessToken", accessToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      const userData = {
        id: data.user.id,
        name: data.user.employer?.name || data.user.employee?.name || "",
        email: data.user.email || "",
        nationalId: data.user.employee?.nationalId || "",
        city: data.user.employee?.city || "",
        bio: data.user.employee?.bio || "",
        experienceLevel: data.user.employee?.experienceLevel || "",
        companyName: data.user.employer?.companyName || "",
        role: data.user.role || "",
      };

      await setUser(userData);
      return userData;
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign up",
      });
      // throw error;
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
