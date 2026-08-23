import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { router } from "expo-router";
import axiosClient from "../src/api/axiosClient";
import Toast from 'react-native-toast-message'; // Correct import for Toast

export default function WithdrawScreen() {
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [bankAccount, setBankAccount] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBank = async () => {
      try {
        const res = await axiosClient.get("bank/account/");
        setBankAccount(res.data);
      } catch {
        setBankAccount(null);
      } finally {
        setFetching(false);
      }
    };
    fetchBank();
  }, []);

 const handleWithdraw = async () => {
  if (!amount || !pin) {
    setError("Please enter amount and PIN");
    return;
  }

  if (isNaN(Number(amount)) || Number(amount) <= 0) {
    setError("Please enter a valid amount");
    return;
  }

  setLoading(true);
  setError("");

  try {
    // Step 1: Verify PIN → get temporary pin_token
    const pinRes = await axiosClient.post("verify-pin/", {
      pin: pin,
    });

    const pinToken = pinRes.data.pin_token;

    if (!pinToken) {
      setError("Failed to verify PIN");
      setLoading(false);
      return;
    }

    // Step 2: Call withdraw with the pin_token
    const res = await axiosClient.post("withdraw/", {   // ← make sure this matches your backend URL
      amount: amount,
      pin_token: pinToken,
    });

    // Success
    Toast.show({
      type: "success",
      text1: "Withdrawal Successful ✅",
      text2: res.data.message || "Your withdrawal is being processed",
    });

    setAmount("");
    setPin("");

    // Go back to Dashboard
    setTimeout(() => {
      router.replace("/(tabs)");
    }, 800);

  } catch (err: any) {
    console.log("Withdraw error:", err.response?.data);
    const message =
      err.response?.data?.error ||
      err.response?.data?.detail ||
      "Withdrawal failed. Please try again.";
    setError(message);

    Toast.show({
      type: "error",
      text1: "Withdrawal Failed",
      text2: message,
    });
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
        <Text style={styles.title}>Withdraw</Text>
        <Text style={styles.subtitle}>Send money to your linked bank account</Text>

        {bankAccount ? (
          <View style={styles.bankCard}>
            <Text style={styles.bankLabel}>Withdrawing to</Text>
            <Text style={styles.bankName}>
              {bankAccount.account_name || bankAccount.accountName}
            </Text>
            <Text style={styles.bankDetails}>
              {bankAccount.bank_name || bankAccount.bankName} •{" "}
              {bankAccount.account_number || bankAccount.accountNumber}
            </Text>
          </View>
        ) : (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>
              No bank account linked. Please link a bank account first.
            </Text>
            <Button
              mode="outlined"
              onPress={() => router.push("/bank-account")}
              style={{ marginTop: 12 }}
            >
              Link Bank Account
            </Button>
          </View>
        )}

        <TextInput
          label="Amount (NGN)"
          value={amount}
          onChangeText={setAmount}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          disabled={!bankAccount}
        />

        <TextInput
          label="Transaction PIN"
          value={pin}
          onChangeText={setPin}
          mode="outlined"
          secureTextEntry
          keyboardType="numeric"
          style={styles.input}
          disabled={!bankAccount}
        />

        {error ? (
          <HelperText type="error" visible={true}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleWithdraw}
          loading={loading}
          disabled={!bankAccount}
          style={styles.button}
          contentStyle={{ paddingVertical: 6 }}
        >
          Withdraw
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
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
    marginBottom: 24,
  },
  bankCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  bankLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  bankName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0F172A",
    marginTop: 4,
  },
  bankDetails: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  warningCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  warningText: {
    color: "#92400E",
    fontSize: 14,
  },
  input: {
    marginBottom: 14,
  },
  button: {
    marginTop: 8,
    borderRadius: 10,
  },
});