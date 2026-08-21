import { Platform } from "react-native";
import * as Application from "expo-application";
import * as Device from "expo-device";

const FINGERPRINT_KEY = "DEVICE_FINGERPRINT";

export async function getDeviceFingerprint(): Promise<string> {
  try {
    // On web we use localStorage
    if (Platform.OS === "web") {
      let fingerprint = localStorage.getItem(FINGERPRINT_KEY);
      if (fingerprint) return fingerprint;

      const parts = [
        "web",
        navigator.userAgent.slice(0, 40),
        Date.now().toString(36),
      ];
      fingerprint = parts.join("|");
      localStorage.setItem(FINGERPRINT_KEY, fingerprint);
      return fingerprint;
    }

    // On native we use SecureStore
    const SecureStore = await import("expo-secure-store");
    let fingerprint = await SecureStore.getItemAsync(FINGERPRINT_KEY);

    if (fingerprint) return fingerprint;

    const parts = [
      Platform.OS,
      Device.modelName || "unknown",
      Device.brand || "unknown",
      Device.osVersion || "unknown",
      Application.applicationId || "unknown",
    ];

    fingerprint = parts.join("|") + "|" + Date.now().toString(36);
    await SecureStore.setItemAsync(FINGERPRINT_KEY, fingerprint);
    return fingerprint;
  } catch (error) {
    console.log("Fingerprint error:", error);
    // Fallback
    return `fallback|${Platform.OS}|${Date.now()}`;
  }
}