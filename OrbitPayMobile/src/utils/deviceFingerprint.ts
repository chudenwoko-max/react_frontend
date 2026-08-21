import { Platform } from "react-native";
import * as Application from "expo-application";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";

const FINGERPRINT_KEY = "DEVICE_FINGERPRINT";

export async function getDeviceFingerprint(): Promise<string> {
  // Try to get existing fingerprint
  let fingerprint = await SecureStore.getItemAsync(FINGERPRINT_KEY);

  if (fingerprint) {
    return fingerprint;
  }

  // Create a new fingerprint
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
}