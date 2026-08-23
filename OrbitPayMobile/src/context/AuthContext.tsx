import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import axiosClient from "../api/axiosClient";
import { setBiometricEnabled } from "../utils/biometric"; // ← add this import

type User = any;

interface AuthContextType {
  user: User | null | undefined;
  login: (access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Helpers that work on both web and mobile
const saveToken = async (key: string, value: string) => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getToken = async (key: string) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
};

const deleteToken = async (key: string) => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await getToken("ACCESS_TOKEN");
        if (!token) {
          setUser(null);
          return;
        }
        const res = await axiosClient.get("profile/");
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (access: string, refresh: string) => {
    await saveToken("ACCESS_TOKEN", access);
    await saveToken("REFRESH_TOKEN", refresh);
    const res = await axiosClient.get("profile/");
    setUser(res.data);
  };

  const logout = async () => {
    await deleteToken("ACCESS_TOKEN");
    await deleteToken("REFRESH_TOKEN");
    // Clear biometric preference on logout
    try {
      await setBiometricEnabled(false);
    } catch (e) {
      console.log("Failed to clear biometric flag", e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);