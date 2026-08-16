import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import axiosClient from "../../src/api/axiosClient";

export default function SendScreen() {
  const { selectedUser } = useLocalSearchParams<{ selectedUser?: string }>();
  const [recipient, setRecipient] = useState(selectedUser || "");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
  if (!recipient || !amount || !pin) {
    setError("Please fill in recipient, amount and PIN");
    return;
  }

  if (isNaN(Number(amount)) || Number(amount) <= 0) {
    setError("Please enter a valid amount");
    return;
  }

  setLoading(true);
  setError("");

  try {
    // 1. First get a pin_token
    const tokenRes = await axiosClient.post("create-pin/", {
      pin: pin, // some backends require the pin here too
    });

    const pinToken = tokenRes.data.pin_token;

    if (!pinToken) {
      throw new Error("Could not get PIN token");
    }

    // 2. Now send the money with the token
    const res = await axiosClient.post("send-money/", {
      recipient: recipient,
      amount: amount,
      pin: pin,
      pin_token: pinToken,   // ← this was missing
      note: note || "",
    });

    // Web-friendly success
    window.alert(res.data.message || "Money sent successfully!");

    setRecipient("");
    setAmount("");
    setPin("");
    setNote("");
    router.replace("/(tabs)");
  } catch (err: any) {
    console.log("Send error:", err.response?.data);
    const message =
      err.response?.data?.error ||
      err.response?.data?.detail ||
      "Failed to send money. Please try again.";
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
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Send Money</Text>
        <Text style={styles.subtitle}>Transfer to another OrbitPay user</Text>

        {/* Searchable Recipient Field */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/search-users",
              params: { returnTo: "send" },
            })
          }
          activeOpacity={0.7}
        >
          <View pointerEvents="none">
            <TextInput
              label="Recipient Username"
              value={recipient}
              mode="outlined"
              style={styles.input}
              right={<TextInput.Icon icon="magnify" />}
            />
          </View>
        </TouchableOpacity>

        <TextInput
          label="Amount (NGN)"
          value={amount}
          onChangeText={setAmount}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          label="Transaction PIN"
          value={pin}
          onChangeText={setPin}
          mode="outlined"
          secureTextEntry
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          mode="outlined"
          style={styles.input}
        />

        {error ? (
          <HelperText type="error" visible={true}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleSend}
          loading={loading}
          style={styles.button}
          contentStyle={{ paddingVertical: 6 }}
        >
          Send Money
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  inner: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 28,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 12,
    borderRadius: 10,
  },
});