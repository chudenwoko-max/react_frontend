import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import axiosClient from "../api/axiosClient";
import { setBiometricEnabled } from "../utils/biometric";
import {
  registerForPushNotificationsAsync,
  unregisterPushToken,
} from "../notifications/push";

type User = any;

interface AuthContextType {
  user: User | null | undefined;
  login: (username: string, password: string) => Promise<any>;
  completeLogin: (access: string, refresh: string) => Promise<void>;   // ⭐ PATCHED
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

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

  // ⭐ Updated login: sends device_name + device_type
  const login = async (username: string, password: string) => {
    const u = (username || "").trim();
    const p = password || "";

    if (u.startsWith("eyJ") || p.startsWith("eyJ")) {
      throw new Error("Enter your account username and password, not a saved token");
    }

    const payload = {
      username: u,
      password: p,
      device_name: Platform.OS === "web" ? "Web Browser" : "Android Phone",
      device_type: Platform.OS,
    };

    const res = await axiosClient.post("login/", payload);
    const { access, refresh } = res.data;

    if (!access || !refresh) {
      throw new Error(res.data?.message || "Login did not return tokens");
    }

    await saveToken("ACCESS_TOKEN", access);
    await saveToken("REFRESH_TOKEN", refresh);

    const profileRes = await axiosClient.get("profile/");
    setUser(profileRes.data);

    registerForPushNotificationsAsync().catch((e) =>
      console.log("Failed to register push token", e)
    );

    return res.data;
  };

  // ⭐ NEW: completeLogin for OTP/TOTP flows
  const completeLogin = async (access: string, refresh: string) => {
    await saveToken("ACCESS_TOKEN", access);
    await saveToken("REFRESH_TOKEN", refresh);

    const profileRes = await axiosClient.get("profile/");
    setUser(profileRes.data);

    registerForPushNotificationsAsync().catch((e) =>
      console.log("Failed to register push token", e)
    );
  };

  const logout = async () => {
    try {
      await unregisterPushToken();
    } catch (e) {
      console.log("Failed to unregister push token", e);
    }

    await deleteToken("ACCESS_TOKEN");
    await deleteToken("REFRESH_TOKEN");

    try {
      await setBiometricEnabled(false);
    } catch (e) {
      console.log("Failed to clear biometric flag", e);
    }

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        completeLogin,   // ⭐ PATCHED
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
