import { Platform } from "react-native";
import axiosClient from "../api/axiosClient";

type ExpoDevice = typeof import("expo-device");
type ExpoConstants = typeof import("expo-constants");
type ExpoNotifications = typeof import("expo-notifications");

let device: ExpoDevice | null = null;
let constants: ExpoConstants | null = null;
let notifications: ExpoNotifications | null = null;

try {
  device = require("expo-device") as ExpoDevice;
} catch (error) {
  console.warn("Device information is not available in this runtime:", error);
}

try {
  constants = require("expo-constants") as ExpoConstants;
} catch (error) {
  console.warn("Expo configuration is not available in this runtime:", error);
}

try {
  notifications = require("expo-notifications") as ExpoNotifications;
} catch (error) {
  console.warn("Notifications are not available in this runtime:", error);
}

export function getNotifications(): ExpoNotifications | null {
  return notifications;
}

if (Platform.OS !== "web" && notifications) {
  notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (
    Platform.OS === "web" ||
    !device ||
    !constants ||
    !notifications
  ) {
    return null;
  }
  // CHANGE: no google-services.json yet. A throw here closes the release APK.
  return null;
}

export async function unregisterPushToken(token?: string | null) {
  if (Platform.OS === "web") return;
  try {
    await axiosClient.post("devices/unregister/", token ? { token } : {});
  } catch {
    // ignore logout failures
  }
}

export function getNotificationRoute(data: Record<string, any> | undefined) {
  const screen = data?.screen;
  if (screen === "requests") return "/(tabs)/requests";
  if (screen === "transactions") return "/(tabs)/history";
  if (screen === "wallet") return "/(tabs)/wallet";
  return "/(tabs)";
}