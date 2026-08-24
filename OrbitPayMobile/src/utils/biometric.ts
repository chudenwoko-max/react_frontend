import { Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const BIOMETRIC_ENABLED_KEY = "orbitpay_biometric_enabled";

// Helpers that work on both web and native
const saveItem = async (key: string, value: string) => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getItem = async (key: string) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
};

const deleteItem = async (key: string) => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export type BiometricStatus = {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  canUseBiometrics: boolean;
  label: string;
};

export async function getBiometricStatus(): Promise<BiometricStatus> {
  // Biometrics are not available on web
  if (Platform.OS === "web") {
    return {
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
      canUseBiometrics: false,
      label: "Biometrics",
    };
  }

  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

  let label = "Biometrics";
  if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    label = "Face ID";
  } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    label = "Fingerprint";
  } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    label = "Iris";
  }

  return {
    hasHardware,
    isEnrolled,
    supportedTypes,
    canUseBiometrics: hasHardware && isEnrolled,
    label,
  };
}

export async function isBiometricEnabled(): Promise<boolean> {
  const value = await getItem(BIOMETRIC_ENABLED_KEY);
  return value === "true";
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await saveItem(BIOMETRIC_ENABLED_KEY, enabled ? "true" : "false");
}

export async function authenticateWithBiometrics(
  promptMessage = "Unlock OrbitPay"
): Promise<{ success: boolean; error?: string }> {
  if (Platform.OS === "web") {
    return { success: false, error: "Biometrics not available on web" };
  }

  const status = await getBiometricStatus();

  if (!status.canUseBiometrics) {
    return {
      success: false,
      error: status.hasHardware ? "No biometrics enrolled" : "No biometric hardware",
    };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    fallbackLabel: "Use PIN",
    cancelLabel: "Cancel",
    disableDeviceFallback: false,
  });

  if (result.success) {
    return { success: true };
  }

  return {
    success: false,
    error: result.error || "Authentication failed",
  };
}