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
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSetPin = async () => {
  if (!pin || !confirmPin) {
    setError("Please fill in both fields");
    return;
  }

  if (pin.length < 4) {
    setError("PIN must be at least 4 digits");
    return;
  }

  if (pin !== confirmPin) {
    setError("PINs do not match");
    return;
  }

  setLoading(true);
  setError("");

  try {
    // Try the most common correct endpoints + payload
    let res;
    try {
      res = await axiosClient.post("set-pin/", {
        pin: pin,
        confirm_pin: confirmPin,
      });
    } catch {
      res = await axiosClient.post("create-pin/", {
        pin: pin,
        confirm_pin: confirmPin,
      });
    }

    // Web-friendly success message
    window.alert(res.data.message || "PIN set successfully!");

    setPin("");
    setConfirmPin("");
    router.back();
  } catch (err: any) {
    console.log("Set PIN error:", err.response?.data);
    const message =
      err.response?.data?.error ||
      err.response?.data?.detail ||
      err.response?.data?.message ||
      "Failed to set PIN. Please try again.";
    setError(message);
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
        <Text style={styles.title}>Set Your PIN</Text>
        
        <TextInput
          label="PIN"
          value={pin}
          onChangeText={setPin}
          secureTextEntry
          keyboardType="numeric"
          maxLength={6}
          style={styles.input}
        />
        
        <TextInput
          label="Confirm PIN"
          value={confirmPin}
          onChangeText={setConfirmPin}
          secureTextEntry
          keyboardType="numeric"
          maxLength={6}
          style={styles.input}
        />
        
        {error && <HelperText type="error">{error}</HelperText>}
        
        <Button
          mode="contained"
          onPress={handleSetPin}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Set PIN
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
  },
});