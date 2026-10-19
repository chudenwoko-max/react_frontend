import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { isAxiosError } from "axios";
import axiosClient from "../api/axiosClient";

type UnlockResponse = { data: Record<string, unknown> };

type Props = {
  onUnlocked?: (response: UnlockResponse) => void | boolean | Promise<void | boolean>;
};

function responseMessage(error: unknown, fallback: string) {
  if (!isAxiosError<{ error?: string; detail?: string; message?: string } | string>(error)) {
    return fallback;
  }
  const data = error.response?.data;
  if (typeof data === "string") return data;
  return data?.error || data?.detail || data?.message || fallback;
}

export default function UnlockWallet({ onUnlocked }: Props) {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const requestCode = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await axiosClient.post("wallet/unlock/request/", null);
      setStep("verify");
      Alert.alert("Code sent", "Check your email for the unlock code.");
    } catch (error) {
      Alert.alert("Error", responseMessage(error, "Could not send code"));
    } finally {
      setLoading(false);
    }
  };

  const unlock = async () => {
    if (loading) return;
    if (!/^\d{6}$/.test(otp.trim())) {
      Alert.alert("Code required", "Enter the 6-digit code sent to your email.");
      return;
    }
    if (!pin.trim()) {
      Alert.alert("PIN required", "Enter your PIN to unlock your wallet.");
      return;
    }

    setLoading(true);
    let response: UnlockResponse;
    try {
      response = await axiosClient.post("wallet/unlock/", {
        otp: otp.trim(),
        pin: pin.trim(),
      });
    } catch (error) {
      Alert.alert("Error", responseMessage(error, "Could not unlock wallet"));
      setLoading(false);
      return;
    }

    setLoading(false);
    Alert.alert("Success", "Wallet unlocked.");
    const continueUnlock = await onUnlocked?.(response);
    if (continueUnlock === false) {
      Alert.alert("Wallet still frozen", "Please request a new code and try again.");
      return;
    }
    setCompleted(true);
  };

  if (completed) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Wallet unlocked</Text>
        <Text style={styles.description}>Sign in to continue to your account.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet locked</Text>
      {step === "request" ? (
        <>
          <Text style={styles.description}>
            Request an email code to unlock your wallet.
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.button}
            onPress={requestCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Send unlock code</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.description}>
            Enter the code sent to your email and your PIN.
          </Text>
          <TextInput
            accessibilityLabel="6-digit email code"
            style={styles.input}
            placeholder="6-digit code"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChangeText={(value) => setOtp(value.replace(/\D/g, ""))}
            editable={!loading}
          />
          <TextInput
            accessibilityLabel="Wallet PIN"
            style={styles.input}
            placeholder="PIN"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            value={pin}
            onChangeText={(value) => setPin(value.replace(/\D/g, ""))}
            editable={!loading}
          />
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.button}
            onPress={unlock}
            disabled={loading || !otp || !pin}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Confirm unlock</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  title: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "700",
  },
  description: {
    color: "#64748B",
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
