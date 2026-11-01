import { Platform } from "react-native";
import * as Device from "expo-device";

export async function isDeviceCompromised(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  if (Platform.OS !== "android") return false;
  try {
    return await Device.isRootedExperimentalAsync();
  } catch {
    return false;
  }
}