import { useAuth } from "../../src/context/AuthContext";
import { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  DeviceEventEmitter,
} from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
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
import { FINANCIALS_REFRESH } from "../../src/notifications/refreshOnPush";
import ClearHoldButton from "../../src/components/ClearHoldButton";
import { isPaymentHoldError } from "../../src/utils/paymentHold";
import MenuHeader from "../../src/components/MenuHeader";

const HIGH_VALUE_THRESHOLD = 50000;

export default function SendScreen() {
  const { logout } = useAuth();
  const { selectedUser } = useLocalSearchParams<{ selectedUser?: string }>();
  // CHANGE: mode can switch. It was locked to user, so bank never posted.
  const [sendMode, setSendMode] = useState<"user" | "bank">("user");
  const [recipient, setRecipient] = useState(selectedUser || "");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [favorites, setFavorites] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showClearHold, setShowClearHold] = useState(false);
  const [isHighValue, setIsHighValue] = useState(false);
  const [limits, setLimits] = useState<{
    per_send_limit: string | null;
    remaining_today: string | null;
  } | null>(null);

  useEffect(() => {
    axiosClient
      .get("favorites/")
      .then((res) => {
        const rows = Array.isArray(res.data)
          ? res.data
          : res.data.results || res.data.favorites || [];
        setFavorites(rows);
      })
      .catch(() => setFavorites([]));
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      axiosClient
        .get("limits/")
        .then((res) => {
          if (!active) return;
          const perSendLimit =
            res.data.per_send_limit ?? res.data.limits?.single_send_ngn;
          const remaining = res.data.remaining_today;
          setLimits({
            per_send_limit: perSendLimit == null ? null : String(perSendLimit),
            remaining_today: remaining == null ? null : String(remaining),
          });
        })
        .catch((err) => {
          if (active) console.error("Could not refresh send limits:", err);
        });

      return () => {
        active = false;
      };
    }, [])
  );

  const favHandle = (f: any) =>
    f.recipient_username || f.username || f.recipient?.username || "";

  const favLabel = (f: any) => f.nickname || favHandle(f) || "User";

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
      setError("Account number and bank are required");
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
      const tokenRes = await axiosClient.post("create-pin/", { pin: String(pin) });
      const pinToken = tokenRes.data.pin_token;
      if (!pinToken) throw new Error("Could not get PIN token");

      let highValueToken = null;

      if (numericAmount >= HIGH_VALUE_THRESHOLD) {
        setIsHighValue(true);

        const confirmRes = await axiosClient.post("send-money/high-value-confirm/", {
          amount: numericAmount,
          recipient: sendMode === "bank" ? accountNumber : recipient,
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
        sendMode === "bank"
          ? `send_bank_${bankCode}_${accountNumber}_${numericAmount}`
          : `send_user_${recipient}_${numericAmount}`;
      const reference_id = await getOrCreateReferenceId(operationKey);

      const payload: any =
        sendMode === "bank"
          ? {
              destination: "bank",
              account_number: accountNumber,
              bank_code: bankCode,
              account_name: accountName || "",
              bank_name: bankName || "",
              amount: numericAmount,
              pin: String(pin),
              pin_token: pinToken,
              note: note || "",
              description: note || "Bank transfer",
              reference_id,
            }
          : {
              destination: "user",
              recipient,
              amount: numericAmount,
              pin: String(pin),
              pin_token: pinToken,
              note: note || "",
              description: note || "Money Transfer",
              reference_id,
            };

      if (highValueToken) payload.high_value_token = highValueToken;

      const res = await axiosClient.post("send-money/", payload).catch((err: unknown) => {
        if (isPaymentHoldError(err)) setShowClearHold(true);
        throw err;
      });

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
      setAmount("");
      setPin("");
      setNote("");

      setTimeout(() => {
        router.back();
      }, 600);
    } catch (err: any) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 401) {
        await logout();
        router.replace("/(auth)/login");
        return;
      }

      const raw =
        data?.detail ||
        data?.error ||
        `${err.message || "Unknown error"} (status: ${status || "N/A"})`;

      setError(typeof raw === "string" ? raw : JSON.stringify(raw));
    } finally {
      setLoading(false);
      setIsHighValue(false);
    }
  };

  return (
    <>
      <MenuHeader title="Send Money" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>
          {sendMode === "bank"
            ? "Transfer to a bank account (Paystack test)"
            : "Transfer to another Payhost user"}
        </Text>

        {limits?.per_send_limit != null ? (
          <Text style={{ color: "#64748B", marginBottom: 12 }}>
            Limit ₦{Number(limits.per_send_limit).toLocaleString()} per send
            {limits.remaining_today != null
              ? ` · ₦${Number(limits.remaining_today).toLocaleString()} left today`
              : ""}
          </Text>
        ) : null}

        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, sendMode === "user" && styles.modeBtnOn]}
            onPress={() => setSendMode("user")}
          >
            <Text style={[styles.modeText, sendMode === "user" && styles.modeTextOn]}>
              Payhost user
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

        {sendMode === "user" && favorites.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: "#64748B", marginBottom: 8, fontWeight: "600" }}>
              Favorites
            </Text>
            {favorites.map((f) => (
              <TouchableOpacity
                key={f.id || favHandle(f)}
                onPress={() => setRecipient(favHandle(f))}
                style={{
                  backgroundColor: "#E2E8F0",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontWeight: "700", color: "#0F172A" }}>
                  {favLabel(f)}
                </Text>
                <Text style={{ color: "#64748B" }}>@{favHandle(f)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {sendMode === "bank" ? (
          <>
            <TextInput
              label="Account number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              mode="outlined"
              keyboardType="number-pad"
              style={styles.input}
            />
            <TextInput
              label="Bank code"
              value={bankCode}
              onChangeText={setBankCode}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Account name"
              value={accountName}
              onChangeText={setAccountName}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Bank name"
              value={bankName}
              onChangeText={setBankName}
              mode="outlined"
              style={styles.input}
            />
          </>
        ) : (
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

        {showClearHold || /new device hold/i.test(error) ? (
          <ClearHoldButton
            onCleared={() => {
              setShowClearHold(false);
              setError("");
              DeviceEventEmitter.emit(FINANCIALS_REFRESH);
            }}
          />
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
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  inner: { padding: 20, paddingTop: 20 },
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