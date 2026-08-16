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
import axiosClient from "../../src/api/axiosClient";
import { router } from "expo-router";

export default function FundWalletScreen() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFund = async () => {
  if (!amount) {
    setError("Please enter an amount");
    return;
  }

  if (isNaN(Number(amount)) || Number(amount) <= 0) {
    setError("Please enter a valid amount");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const res = await axiosClient.post("wallet/fund/", {
      amount: amount,
    });

    const newBalance = res.data.new_balance
      ? Number(res.data.new_balance).toLocaleString("en-NG", {
          style: "currency",
          currency: "NGN",
          minimumFractionDigits: 2,
        })
      : null;

    // Web-friendly success message
    const message = newBalance
      ? `Wallet funded successfully!\n\nNew Balance: ${newBalance}`
      : res.data.message || "Wallet funded successfully!";

    // This works reliably on Edge / Chrome
    window.alert(message);

    setAmount("");
    router.replace("/(tabs)");
  } catch (err: any) {
    console.log("Fund error:", err.response?.data);
    const message =
      err.response?.data?.error ||
      err.response?.data?.detail ||
      "Failed to fund wallet. Please try again.";
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
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Fund Wallet</Text>
        <Text style={styles.subtitle}>Add money to your OrbitPay wallet</Text>

        <TextInput
          label="Amount (NGN)"
          value={amount}
          onChangeText={setAmount}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
        />

        {error ? (
          <HelperText type="error" visible={true}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleFund}
          loading={loading}
          style={styles.button}
          contentStyle={{ paddingVertical: 6 }}
        >
          Fund Wallet
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