import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import api from "../api/axiosClient";
 // <-- change this path to your API client

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("orbitpay-default", {
    name: "OrbitPay",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#4F46E5",
    sound: "default",
  });
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) return null;

  await ensureAndroidChannel();

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const asked = await Notifications.requestPermissionsAsync();
    status = asked.status;
  }
  if (status !== "granted") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    console.warn("Missing EAS projectId; cannot get Expo push token");
    return null;
  }

  const tokenRes = await Notifications.getExpoPushTokenAsync({ projectId });
  const token = tokenRes.data;

  await api.post("/api/devices/register/", {
    token,
    platform: Platform.OS,
    device_name: `${Device.manufacturer ?? ""} ${Device.modelName ?? ""}`.trim(),
  });

  return token;
}

export async function unregisterPushToken(token?: string | null) {
  try {
    await api.post("/api/devices/unregister/", token ? { token } : {});
  } catch {
    // ignore on logout
  }
}

export function getNotificationRoute(data: Record<string, any> | undefined) {
  const screen = data?.screen;
  if (screen === "requests") return "/(tabs)/requests";
  if (screen === "transactions") return "/(tabs)/history";
  if (screen === "wallet") return "/(tabs)/wallet";
  return "/(tabs)";
}