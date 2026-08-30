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

const HIGH_VALUE_THRESHOLD = 50000;

export default function SendScreen() {
  const { selectedUser } = useLocalSearchParams<{ selectedUser?: string }>();
  const [recipient, setRecipient] = useState(selectedUser || "");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHighValue, setIsHighValue] = useState(false);

  const handleSend = async () => {
    if (!recipient || !amount || !pin) {
      setError("Please fill in recipient, amount and PIN");
      return;
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    // ⭐ Transaction Guard — prevents accidental large transfers
    const guard = await requireTransactionGuard(numericAmount, SEND_GUARD_AMOUNT);
    if (!guard.ok) return;

    setLoading(true);
    setError("");

    try {
      // 1. PIN token
      const tokenRes = await axiosClient.post("create-pin/", { pin });
      const pinToken = tokenRes.data.pin_token;

      if (!pinToken) {
        throw new Error("Could not get PIN token");
      }

      let highValueToken = null;

      // 2. High-value confirmation
      if (numericAmount >= HIGH_VALUE_THRESHOLD) {
        setIsHighValue(true);

        const confirmRes = await axiosClient.post(
          "send-money/high-value-confirm/",
          { amount: numericAmount, recipient }
        );

        highValueToken = confirmRes.data.high_value_token;

        // ⭐ Cross-platform confirmation (web + native)
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

      // ⭐ 3. Idempotency — generate reference_id BEFORE sending
      const operationKey = `send:${recipient}:${numericAmount}`;
      const reference_id = await getOrCreateReferenceId(operationKey);

      // 4. Build payload
      const payload: any = {
        recipient,
        amount: numericAmount,
        pin,
        pin_token: pinToken,
        note: note || "",
        reference_id,
      };

      if (highValueToken) {
        payload.high_value_token = highValueToken;
      }

      // 5. Send money
      const res = await axiosClient.post("send-money/", payload);

      // ⭐ Clear idempotency key ONLY on success
      await clearReferenceId(operationKey);

      Alert.alert("Success", res.data.message || "Money sent successfully!");

      setRecipient("");
      setAmount("");
      setPin("");
      setNote("");
      router.replace("/(tabs)");
    } catch (err: any) {
      console.log("Send error:", err.response?.data);

      // ⭐ Do NOT clear reference_id — retry must reuse it
      const message =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to send money. Please try again.";
      setError(message);
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
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Send Money</Text>
        <Text style={styles.subtitle}>Transfer to another OrbitPay user</Text>

        {Number(amount) >= HIGH_VALUE_THRESHOLD && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              High-value transfer (₦50,000+). Extra confirmation required.
            </Text>
          </View>
        )}

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
          disabled={loading}
          style={styles.button}
          contentStyle={{ paddingVertical: 6 }}
        >
          {Number(amount) >= HIGH_VALUE_THRESHOLD
            ? "Confirm & Send"
            : "Send Money"}
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
