import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { router } from "expo-router";
import axiosClient from "../src/api/axiosClient";
import Toast from "react-native-toast-message";
import {
  getOrCreateReferenceId,
  clearReferenceId,
} from "../src/utils/idempotency";

export default function WithdrawScreen() {
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [bankAccount, setBankAccount] = useState<any>(null);
  const [error, setError] = useState("");
  const [pendingRef, setPendingRef] = useState("");

  const hasPending = Boolean(pendingRef);

  useEffect(() => {
    const boot = async () => {
      try {
        const res = await axiosClient.get("bank/account/");
        setBankAccount(res.data);
      } catch {
        setBankAccount(null);
      }

      try {
        const pendingRes = await axiosClient.get("wallet/withdraw/pending/");
        const pending = pendingRes.data?.pending;
        if (pending?.reference) {
          setPendingRef(pending.reference);
          if (pending.amount) setAmount(String(pending.amount));
        }
      } catch (e) {
        console.log("Pending withdraw fetch error:", e);
      }
    };
    boot();
  }, []);

  const operationKey = `withdraw:${amount}`;

  const handleWithdraw = async () => {
    if (hasPending || loading) return;

    if (!amount || !pin) {
      setError("Please enter amount and PIN");
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) < 100) {
      setError("Minimum withdrawal amount is ₦100");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const pinRes = await axiosClient.post("verify-pin/", { pin });
      const pinToken = pinRes.data.pin_token;
      if (!pinToken) {
        setError("Failed to verify PIN");
        setLoading(false);
        return;
      }

      const reference_id = await getOrCreateReferenceId(operationKey);

      const res = await axiosClient.post("wallet/withdraw/", {
        amount: amount,
        pin_token: pinToken,
        reference_id,
      });

      await clearReferenceId(operationKey);
      setPendingRef("");
      setAmount("");
      setPin("");

      Toast.show({
        type: "success",
        text1: res.data?.idempotent ? "Already processed" : "Withdrawal Successful",
        text2: res.data.message || "Your withdrawal is being processed",
      });

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

  const handleCancelPending = async () => {
    const message = "Cancel this in-progress withdrawal and start again?";
    const confirmed =
      Platform.OS === "web"
        ? window.confirm(message)
        : true;

    if (Platform.OS !== "web") {
      // Paper/Alert optional; confirm is enough on web where the bug was
    }
    if (!confirmed) return;

    try {
      await axiosClient.post("wallet/withdraw/cancel/", { reference: pendingRef });
    } catch (e) {
      console.log("Cancel withdraw error:", e);
    }
    await clearReferenceId(operationKey);
    setPendingRef("");
    setError("");
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
            <Button mode="outlined" onPress={() => router.push("/bank-account")} style={{ marginTop: 12 }}>
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
          disabled={!bankAccount || hasPending}
        />

        <TextInput
          label="Transaction PIN"
          value={pin}
          onChangeText={setPin}
          mode="outlined"
          secureTextEntry
          keyboardType="numeric"
          style={styles.input}
          disabled={!bankAccount || hasPending}
        />

        {hasPending ? (
          <HelperText type="info" visible>
            A withdrawal is already in progress for this amount. Wait for it to finish or cancel.
          </HelperText>
        ) : null}

        {error ? (
          <HelperText type="error" visible>
            {error}
          </HelperText>
        ) : null}

        {!hasPending ? (
          <Button
            mode="contained"
            onPress={handleWithdraw}
            loading={loading}
            disabled={!bankAccount || loading}
            style={styles.button}
            contentStyle={{ paddingVertical: 6 }}
          >
            Withdraw
          </Button>
        ) : (
          <Button
            mode="outlined"
            onPress={handleCancelPending}
            disabled={loading}
            style={styles.button}
          >
            Cancel and start new
          </Button>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  inner: { padding: 20, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: "700", color: "#0F172A", marginBottom: 6 },
  subtitle: { fontSize: 15, color: "#64748B", marginBottom: 24 },
  bankCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, marginBottom: 20 },
  bankLabel: { fontSize: 13, color: "#64748B" },
  bankName: { fontSize: 17, fontWeight: "600", color: "#0F172A", marginTop: 4 },
  bankDetails: { fontSize: 14, color: "#64748B", marginTop: 2 },
  warningCard: { backgroundColor: "#FEF3C7", borderRadius: 14, padding: 16, marginBottom: 20 },
  warningText: { color: "#92400E", fontSize: 14 },
  input: { marginBottom: 14 },
  button: { marginTop: 8, borderRadius: 10 },
});