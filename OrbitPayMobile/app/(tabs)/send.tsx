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
import {
  getOrCreateReferenceId,
  clearReferenceId,
} from "../../src/utils/idempotency";
import {
  requireTransactionGuard,
  SEND_GUARD_AMOUNT,
} from "../../src/security/transactionGuard";
import Toast from "react-native-toast-message";
import { DeviceEventEmitter } from "react-native";
import { FINANCIALS_REFRESH } from "../../src/notifications/refreshOnPush";

const HIGH_VALUE_THRESHOLD = 50000;

export default function SendScreen() {
  const { selectedUser } = useLocalSearchParams<{ selectedUser?: string }>();
  const [sendMode, setSendMode] = useState<"user" | "bank">("user");
  const [recipient, setRecipient] = useState(selectedUser || "");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHighValue, setIsHighValue] = useState(false);

  const resolveBank = async () => {
    if (!accountNumber || !bankCode) return;
    try {
      const res = await axiosClient.get("banks/resolve/", {
        params: { account_number: accountNumber, bank_code: bankCode },
      });
      const name = res.data?.data?.account_name || res.data?.account_name;
      if (name) setAccountName(name);
    } catch {
      setAccountName("");
    }
  };

  const handleSend = async () => {
    if (!amount || !pin) {
      setError("Please fill in amount and PIN");
      return;
    }
    if (sendMode === "user" && !recipient) {
      setError("Please fill in recipient, amount and PIN");
      return;
    }
    if (sendMode === "bank" && (!accountNumber || !bankCode)) {
      setError("Please fill in bank code and account number");
      return;
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const guard = await requireTransactionGuard(numericAmount, SEND_GUARD_AMOUNT);
    if (!guard.ok) return;

    setLoading(true);
    setError("");

    try {
      const tokenRes = await axiosClient.post("create-pin/", { pin });
      const pinToken = tokenRes.data.pin_token;
      if (!pinToken) throw new Error("Could not get PIN token");

      let highValueToken = null;

      if (numericAmount >= HIGH_VALUE_THRESHOLD) {
        setIsHighValue(true);
        const confirmRes = await axiosClient.post("send-money/high-value-confirm/", {
          amount: numericAmount,
          recipient: sendMode === "user" ? recipient : accountNumber,
        });
        highValueToken = confirmRes.data.high_value_token;

        let confirmed = false;
        if (Platform.OS === "web") {
          confirmed = window.confirm(
            `You are about to send ₦${numericAmount.toLocaleString()}. Confirm this is correct.`
          );
        } else {
          confirmed = await new Promise((resolve) => {
            Alert.alert(
              "High Value Transfer",
              `You are about to send ₦${numericAmount.toLocaleString()}.\n\nPlease confirm this is correct.`,
              [
                { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                { text: "Confirm", onPress: () => resolve(true) },
              ]
            );
          });
        }
        if (!confirmed) {
          setLoading(false);
          return;
        }
      }

      const operationKey =
        sendMode === "user"
          ? `send:user:${recipient}:${numericAmount}`
          : `send:bank:${bankCode}:${accountNumber}:${numericAmount}`;
      const reference_id = await getOrCreateReferenceId(operationKey);

      const payload: any =
        sendMode === "user"
          ? {
              destination: "user",
              recipient,
              amount: numericAmount,
              pin,
              pin_token: pinToken,
              note: note || "",
              description: note || "Money Transfer",
              reference_id,
            }
          : {
              destination: "bank",
              account_number: accountNumber,
              bank_code: bankCode,
              account_name: accountName || "Beneficiary",
              bank_name: bankName || bankCode,
              amount: numericAmount,
              pin,
              pin_token: pinToken,
              note: note || "",
              description: note || "Bank transfer",
              reference_id,
            };

      if (highValueToken) payload.high_value_token = highValueToken;

      const res = await axiosClient.post("send-money/", payload);

      await clearReferenceId(operationKey);
      DeviceEventEmitter.emit(FINANCIALS_REFRESH);

      const message = res.data.message || "Money sent successfully.";
      if (Platform.OS === "web") {
        Toast.show({
          type: "success",
          text1: res.data?.idempotent ? "Already processed" : "Transfer submitted",
          text2: message,
        });
      } else {
        Alert.alert("Success", message);
      }

      setRecipient("");
      setAccountNumber("");
      setBankCode("");
      setBankName("");
      setAccountName("");
      setAmount("");
      setPin("");
      setNote("");

      setTimeout(() => {
        router.replace("/(tabs)");
      }, 600);
    } catch (err: any) {
      console.log("Send error:", err.response?.data);
      const message =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to send money. Please try again.";
      setError(typeof message === "string" ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
      setIsHighValue(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Send Money</Text>
        <Text style={styles.subtitle}>
          {sendMode === "user"
            ? "Transfer to another OrbitPay user"
            : "Transfer to any Nigerian bank account"}
        </Text>

        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, sendMode === "user" && styles.modeBtnOn]}
            onPress={() => setSendMode("user")}
          >
            <Text style={[styles.modeText, sendMode === "user" && styles.modeTextOn]}>
              Orbit user
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, sendMode === "bank" && styles.modeBtnOn]}
            onPress={() => setSendMode("bank")}
          >
            <Text style={[styles.modeText, sendMode === "bank" && styles.modeTextOn]}>
              Bank account
            </Text>
          </TouchableOpacity>
        </View>

        {Number(amount) >= HIGH_VALUE_THRESHOLD && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              High-value transfer (₦50,000+). Extra confirmation required.
            </Text>
          </View>
        )}

        {sendMode === "user" ? (
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
        ) : (
          <>
            <TextInput
              label="Bank code (e.g. 058)"
              value={bankCode}
              onChangeText={setBankCode}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Bank name (optional)"
              value={bankName}
              onChangeText={setBankName}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Account number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              onBlur={resolveBank}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Account name"
              value={accountName}
              onChangeText={setAccountName}
              mode="outlined"
              style={styles.input}
            />
          </>
        )}

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
          <HelperText type="error" visible>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleSend}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={{ paddingVertical: 6 }}
        >
          {Number(amount) >= HIGH_VALUE_THRESHOLD ? "Confirm & Send" : "Send Money"}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  inner: { padding: 20, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: "700", color: "#0F172A", marginBottom: 6 },
  subtitle: { fontSize: 15, color: "#64748B", marginBottom: 16 },
  modeRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
  },
  modeBtnOn: { backgroundColor: "#0F172A" },
  modeText: { fontWeight: "600", color: "#475569" },
  modeTextOn: { color: "#FFFFFF" },
  input: { marginBottom: 16 },
  button: { marginTop: 12, borderRadius: 10 },
  warningBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  warningText: {
    color: "#92400E",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});