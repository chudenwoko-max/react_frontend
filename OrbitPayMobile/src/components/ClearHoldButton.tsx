import { useState } from "react";
import { Alert, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
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
      await axiosClient.post("payment-hold/request-clear/");
      setStep("otp");
      Alert.alert("Code sent", "Check your email.");
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
      await axiosClient.post("payment-hold/verify-clear/", { otp: otp.trim(), pin });
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
      <Button mode="outlined" onPress={requestCode} loading={loading} disabled={loading}>
        Verify to unlock now
      </Button>
    );
  }

  return (
    <View>
      <TextInput
        label="Email code"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        autoCapitalize="none"
        style={{ marginTop: 12 }}
      />
      <TextInput
        label="PIN (optional)"
        value={pin}
        onChangeText={setPin}
        secureTextEntry
        keyboardType="number-pad"
        style={{ marginTop: 12 }}
      />
      <Button
        mode="contained"
        onPress={verify}
        loading={loading}
        disabled={loading}
        style={{ marginTop: 12 }}
      >
        Clear hold
      </Button>
    </View>
  );
}
