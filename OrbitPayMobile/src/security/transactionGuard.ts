import { Platform, Alert } from "react-native";
import {
  getBiometricStatus,
  isBiometricEnabled,
  authenticateWithBiometrics,
} from "../utils/biometric";

export const SEND_GUARD_AMOUNT = 50000;
export const BILL_GUARD_AMOUNT = 10000;
export const WITHDRAW_GUARD_AMOUNT = 10000;

export async function requireTransactionGuard(amount: number, threshold: number) {
  if (!Number.isFinite(amount) || amount < threshold) {
    return { ok: true, skipped: true };
  }

  if (Platform.OS === "web") {
    return { ok: true, skipped: true };
  }

  const enabled = await isBiometricEnabled();
  const status = await getBiometricStatus();

  if (!enabled || !status?.canUseBiometrics) {
    return { ok: true, skipped: true };
  }

  const result = await authenticateWithBiometrics(
    `Confirm this ₦${amount.toLocaleString()} transaction`
  );

  if (!result.success) {
    Alert.alert(
      "Verification required",
      result.error || "Biometric confirmation failed. Transaction cancelled."
    );
    return { ok: false, skipped: false };
  }

  return { ok: true, skipped: false };
}