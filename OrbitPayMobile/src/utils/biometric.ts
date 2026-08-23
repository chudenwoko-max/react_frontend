import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'orbitpay_biometric_enabled';

export type BiometricStatus = {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  canUseBiometrics: boolean;
  label: string;
};

export async function getBiometricStatus(): Promise<BiometricStatus> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

  let label = 'Biometrics';
  if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    label = 'Face ID';
  } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    label = 'Fingerprint';
  } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    label = 'Iris';
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
  const value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
  return value === 'true';
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function authenticateWithBiometrics(
  promptMessage = 'Unlock OrbitPay'
): Promise<{ success: boolean; error?: string }> {
  const status = await getBiometricStatus();

  if (!status.canUseBiometrics) {
    return {
      success: false,
      error: status.hasHardware ? 'No biometrics enrolled' : 'No biometric hardware',
    };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    fallbackLabel: 'Use PIN',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });

  if (result.success) {
    return { success: true };
  }

  return {
    success: false,
    error: result.error || 'Authentication failed',
  };
}