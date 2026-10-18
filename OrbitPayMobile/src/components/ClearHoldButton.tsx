import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";
import axiosClient from "../api/axiosClient";

type ClearHoldButtonProps = {
  onCleared?: () => void;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return fallback;
  }

  const response = error.response;
  if (!response || typeof response !== "object" || !("data" in response)) {
    return fallback;
  }

  const data = response.data;
  if (!data || typeof data !== "object") return fallback;

  const payload = data as { error?: unknown; detail?: unknown; message?: unknown };
  const message = payload.error || payload.detail || payload.message;
  return typeof message === "string" ? message : fallback;
}

export default function ClearHoldButton({ onCleared }: ClearHoldButtonProps) {
  const [step, setStep] = useState<"idle" | "otp">("idle");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const requestCode = async () => {
    setLoading(true);
    try {
      await axiosClient.post("payment-hold/request-clear/", null, {
        headers: { "X-Client": "mobile" },
      });
      setStep("otp");
      Alert.alert("Code sent", "Check your email for the 6-digit code.");
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error, "Could not send code"));
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (!otp.trim()) {
      Alert.alert("Email code", "Enter the code sent to your email.");
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post(
        "payment-hold/verify-clear/",
        { otp: otp.trim(), pin: pin.trim() || undefined },
        { headers: { "X-Client": "mobile" } }
      );
      Alert.alert("Success", "Payment hold cleared.");
      setStep("idle");
      setOtp("");
      setPin("");
      onCleared?.();
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error, "Invalid code"));
    } finally {
      setLoading(false);
    }
  };

  if (step === "idle") {
    return (
      <TouchableOpacity style={styles.btn} onPress={requestCode} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Verify to unlock now</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.box}>
      <Text style={styles.label}>Enter the code sent to your email</Text>
      <TextInput
        style={styles.input}
        placeholder="6-digit code"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Transaction PIN (optional)"
        value={pin}
        onChangeText={setPin}
        secureTextEntry
        keyboardType="number-pad"
        editable={!loading}
      />
      <TouchableOpacity style={styles.btn} onPress={verify} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Clear hold</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  btnText: { color: "#fff", fontWeight: "600" },
  box: { marginVertical: 12 },
  label: { marginBottom: 6, fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
});
