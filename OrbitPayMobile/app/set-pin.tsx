import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { router } from "expo-router";
import axiosClient from "../src/api/axiosClient";

export default function SetPinScreen() {
  const [currentPin, setCurrentPin] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSetPin = async () => {
    if (!pin || !confirmPin) {
      setError("Enter and confirm the new PIN");
      return;
    }
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError("PIN must be 4 digits");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // CHANGE: current PIN is the step-up. create-pin/ is not a fallback.
      const res = await axiosClient.post("set-pin/", {
        pin: String(pin),
        confirm_pin: String(confirmPin),
        current_pin: currentPin ? String(currentPin) : undefined,
      });

      const message = res.data?.message || "PIN set successfully";
      if (Platform.OS === "web") window.alert(message);
      else Alert.alert("PIN updated", message);

      setCurrentPin("");
      setPin("");
      setConfirmPin("");
      router.back();
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to set PIN. Please try again.";
      setError(String(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Change PIN</Text>
        <Text style={styles.subtitle}>
          Enter your current PIN. Leave it blank only if you have never set one.
        </Text>

        <TextInput
          label="Current PIN"
          value={currentPin}
          onChangeText={setCurrentPin}
          secureTextEntry
          keyboardType="numeric"
          maxLength={4}
          style={styles.input}
        />
        <TextInput
          label="New PIN"
          value={pin}
          onChangeText={setPin}
          secureTextEntry
          keyboardType="numeric"
          maxLength={4}
          style={styles.input}
        />
        <TextInput
          label="Confirm new PIN"
          value={confirmPin}
          onChangeText={setConfirmPin}
          secureTextEntry
          keyboardType="numeric"
          maxLength={4}
          style={styles.input}
        />

        {error ? <HelperText type="error">{error}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleSetPin}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Update PIN
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8, textAlign: "center", color: "#0F172A" },
  subtitle: { fontSize: 14, color: "#64748B", textAlign: "center", marginBottom: 20 },
  input: { marginBottom: 15 },
  button: { marginTop: 20 },
});