import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";
import axiosClient from "../api/axiosClient";

type ExpoNotifications = typeof import("expo-notifications");

let notifications: ExpoNotifications | null = null;
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

async function ensureAndroidChannel() {
  if (Platform.OS !== "android" || !notifications) return;
  await notifications.setNotificationChannelAsync("orbitpay-default", {
    name: "OrbitPay",
    importance: notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#4F46E5",
    sound: "default",
  });
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  const notificationModule = notifications;
  if (Platform.OS === "web" || !notificationModule) return null;
  // CHANGE: no google-services.json yet. A throw here closes the release APK.
  return null;
  // existing body stays below, unused until FCM is added

  if (!Device.isDevice) return null;

  await ensureAndroidChannel();

  const existing = await notificationModule.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const asked = await notificationModule.requestPermissionsAsync();
    status = asked.status;
  }
  if (status !== "granted") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    console.warn("Missing EAS projectId; cannot get Expo push token");
    return null;
  }

  const tokenRes = await notificationModule.getExpoPushTokenAsync({ projectId });
  const token = tokenRes.data;

  await axiosClient.post("devices/register/", {
    token,
    platform: Platform.OS,
    device_name: `${Device.manufacturer ?? ""} ${Device.modelName ?? ""}`.trim(),
  });

  return token;
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