import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, Vendor, Driver } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  vendor: Vendor | null;
  driver: Driver | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setVendor: (vendor: Vendor | null) => void;
  setDriver: (driver: Driver | null) => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [vendor, setVendorState] = useState<Vendor | null>(null);
  const [driver, setDriverState] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedVendor = localStorage.getItem("vendor");
    const savedDriver = localStorage.getItem("driver");
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedVendor) {
      setVendorState(JSON.parse(savedVendor));
    }
    if (savedDriver) {
      setDriverState(JSON.parse(savedDriver));
    }
    setIsLoading(false);
  }, []);

  const login = (user: User) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    setVendorState(null);
    setDriverState(null);
    localStorage.removeItem("user");
    localStorage.removeItem("vendor");
    localStorage.removeItem("driver");
  };

  const setVendor = (vendor: Vendor | null) => {
    setVendorState(vendor);
    if (vendor) {
      localStorage.setItem("vendor", JSON.stringify(vendor));
    } else {
      localStorage.removeItem("vendor");
    }
  };

  const setDriver = (driver: Driver | null) => {
    setDriverState(driver);
    if (driver) {
      localStorage.setItem("driver", JSON.stringify(driver));
    } else {
      localStorage.removeItem("driver");
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      vendor, 
      driver, 
      isLoading, 
      login, 
      logout, 
      setVendor, 
      setDriver,
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
