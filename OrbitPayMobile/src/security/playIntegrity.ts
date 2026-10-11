import { Platform } from "react-native";
import * as AppIntegrity from "@expo/app-integrity";

const CLOUD_PROJECT_NUMBER = process.env.EXPO_PUBLIC_PLAY_CLOUD_PROJECT_NUMBER || "";

export async function getPlayIntegrityToken(action: string): Promise<string | null> {
  if (Platform.OS !== "android" || !CLOUD_PROJECT_NUMBER) return null;
  try {
    await AppIntegrity.prepareIntegrityTokenProviderAsync(CLOUD_PROJECT_NUMBER);
    const token = await AppIntegrity.requestIntegrityCheckAsync(action);
    return token || null;
  } catch (e) {
    console.log("Play Integrity skipped", e);
    return null;
  }
}