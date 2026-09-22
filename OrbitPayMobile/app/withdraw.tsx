import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
} from "react-native";
import { router } from "expo-router";
import axiosClient from "../src/api/axiosClient";
import { FINANCIALS_REFRESH } from "../src/notifications/refreshOnPush";

export default function WithdrawScreen() {
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosClient.get("bank-accounts/");
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.results || res.data?.accounts || [];
        setAccounts(list);
        if (list[0]?.id) setAccountId(list[0].id);
      } catch {
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSubmit = async () => {
    const naira = Number(amount);
    if (!naira || naira < 100) {
      Alert.alert("Amount", "Minimum withdrawal is ₦100.");
      return;
    }
    if (!pin || pin.length < 4) {
      Alert.alert("PIN", "Enter your transaction PIN.");
      return;
    }
    setBusy(true);
    try {
      // Same PIN token endpoint as app/(tabs)/send.tsx
      const tokenRes = await axiosClient.post("pin/verify/", { pin });
      const pinToken = tokenRes.data.pin_token;
      if (!pinToken) {
        Alert.alert("PIN", "Could not verify PIN.");
        return;
      }

      const body: Record<string, unknown> = {
        amount: naira,
        pin_token: pinToken,
      };
      if (accountId) body.bank_account_id = accountId;

      const res = await axiosClient.post("withdraw/", body);
      DeviceEventEmitter.emit(FINANCIALS_REFRESH);
      Alert.alert(
        "Withdrawal",
        res.data?.message ||
          `Queued (${res.data?.status || "pending"}) ref ${
            res.data?.reference_id || ""
          }`
      );
      router.replace("/(tabs)");
    } catch (e: any) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      if (status === 401) {
        router.replace("/(auth)/login");
        return;
      }
      Alert.alert(
        "Withdraw failed",
        data?.error || data?.detail || data?.code || "Request failed"
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#0F172A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Withdraw to bank</Text>
      <Text style={styles.sub}>
        Paystack test Transfer. Starter may still return 502.
      </Text>

      {accounts.length === 0 ? (
        <Text style={styles.warn}>
          No linked bank account. Link one first; the API will reject withdraw
          without it.
        </Text>
      ) : (
        <Text style={styles.sub}>
          Using {accounts[0]?.bank_name} {accounts[0]?.account_number}
        </Text>
      )}

      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        placeholder="Amount (NGN)"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        placeholder="Transaction PIN"
        secureTextEntry
        value={pin}
        onChangeText={setPin}
        maxLength={6}
      />

      <TouchableOpacity
        style={[styles.btn, busy && { opacity: 0.6 }]}
        onPress={onSubmit}
        disabled={busy}
      >
        <Text style={styles.btnText}>{busy ? "Sending…" : "Withdraw"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
        <Text style={styles.homeText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 24,
    paddingTop: 80,
  },
  title: { fontSize: 24, fontWeight: "700", color: "#0F172A", marginBottom: 8 },
  sub: { fontSize: 14, color: "#64748B", marginBottom: 12, lineHeight: 20 },
  warn: { fontSize: 14, color: "#B45309", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#FFF",
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  homeText: {
    marginTop: 24,
    textAlign: "center",
    color: "#0284C7",
    fontWeight: "600",
  },
});