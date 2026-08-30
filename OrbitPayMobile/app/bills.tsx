import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  TextInput,
  Button,
  HelperText,
  SegmentedButtons,
  RadioButton,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import axiosClient from "../src/api/axiosClient";
import { useRouter } from "expo-router";
import {
  getOrCreateReferenceId,
  clearReferenceId,
} from "../src/utils/idempotency";
import {
  requireTransactionGuard,
  BILL_GUARD_AMOUNT,
} from "../src/security/transactionGuard";

type VirtualCard = {
  id: number;
  card_number?: string;
  last4?: string;
  balance?: string | number;
  status?: string;
  currency?: string;
};

export default function BillsScreen() {
  const [type, setType] = useState("airtime");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [meter, setMeter] = useState("");
  const [smartcard, setSmartcard] = useState("");
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [paymentSource, setPaymentSource] =
    useState<"wallet" | "card">("wallet");
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [loadingCards, setLoadingCards] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await axiosClient.get("cards/");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];

      const activeCards = data.filter(
        (c: VirtualCard) =>
          c.status === "active" && (c.currency === "NGN" || !c.currency)
      );

      setCards(activeCards);
    } catch (err) {
      console.log("Failed to load cards", err);
    } finally {
      setLoadingCards(false);
    }
  };

  const handlePay = async () => {
    if (loading) return;

    // Basic amount validation
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    // ⭐ Transaction Guard — prevents accidental large bill payments
    const guard = await requireTransactionGuard(Number(amount), BILL_GUARD_AMOUNT);
    if (!guard.ok) return;

    // Card validation
    if (paymentSource === "card" && !selectedCardId) {
      setError("Please select a virtual card");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let customer_id = "";

      // Customer ID logic
      if (type === "airtime" || type === "data") {
        if (!phone || !provider) {
          setError("Phone number and network are required");
          setLoading(false);
          return;
        }
        customer_id = phone;
      } else if (type === "electricity") {
        if (!meter || !provider) {
          setError("Meter number and provider are required");
          setLoading(false);
          return;
        }
        customer_id = meter;
      } else if (type === "cable") {
        if (!smartcard || !provider) {
          setError("Smartcard number and provider are required");
          setLoading(false);
          return;
        }
        customer_id = smartcard;
      }

      // ⭐ IDEMPOTENCY KEY
      const numericAmount = Number(amount);
      const operationKey = `bills:${type}:${provider}:${customer_id}:${numericAmount}`;

      const reference_id = await getOrCreateReferenceId(operationKey);

      // ⭐ Build payload
      const payload: any = {
        bill_type: type,
        provider: provider.toUpperCase(),
        amount: numericAmount,
        customer_id,
        reference_id,
      };

      if (type === "data" || type === "cable") {
        payload.package_name = "";
      }

      if (type === "electricity") {
        payload.meter_type = "prepaid";
      }

      if (paymentSource === "card" && selectedCardId) {
        payload.card_id = selectedCardId;
      }

      // ⭐ BILL PAYMENT REQUEST
      const res = await axiosClient.post("bills/pay/", payload);

      // Clear idempotency key ONLY on success
      await clearReferenceId(operationKey);

      Toast.show({
        type: "success",
        text1: "Payment Successful",
        text2: res.data.message || "Bill paid successfully",
      });

      // Reset form
      setPhone("");
      setAmount("");
      setMeter("");
      setSmartcard("");
      setProvider("");
      setSelectedCardId(null);

      setTimeout(() => {
        router.replace("/(tabs)");
      }, 800);
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Payment failed. Please try again.";

      setError(message);

      Toast.show({
        type: "error",
        text1: "Payment Failed",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Bill Payments</Text>

      <SegmentedButtons
        value={type}
        onValueChange={setType}
        buttons={[
          { value: "airtime", label: "Airtime" },
          { value: "data", label: "Data" },
          { value: "electricity", label: "Electricity" },
          { value: "cable", label: "Cable" },
        ]}
        style={{ marginBottom: 20 }}
      />

      {(type === "airtime" || type === "data") && (
        <>
          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />
          <TextInput
            label="Network (MTN, Glo, Airtel, 9mobile)"
            value={provider}
            onChangeText={setProvider}
            mode="outlined"
            style={styles.input}
          />
        </>
      )}

      {type === "electricity" && (
        <>
          <TextInput
            label="Meter Number"
            value={meter}
            onChangeText={setMeter}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Provider (e.g. IKEDC)"
            value={provider}
            onChangeText={setProvider}
            mode="outlined"
            style={styles.input}
          />
        </>
      )}

      {type === "cable" && (
        <>
          <TextInput
            label="Smartcard Number"
            value={smartcard}
            onChangeText={setSmartcard}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Provider (DSTV, GOTV, Startimes)"
            value={provider}
            onChangeText={setProvider}
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

      <Text style={styles.sectionLabel}>Pay with</Text>

      {/* Wallet */}
      <TouchableOpacity
        style={[
          styles.sourceCard,
          paymentSource === "wallet" && styles.sourceCardActive,
        ]}
        onPress={() => {
          setPaymentSource("wallet");
          setSelectedCardId(null);
        }}
      >
        <MaterialCommunityIcons
          name="wallet"
          size={22}
          color={paymentSource === "wallet" ? "#7C3AED" : "#64748B"}
        />
        <Text
          style={[
            styles.sourceText,
            paymentSource === "wallet" && styles.sourceTextActive,
          ]}
        >
          Main Wallet
        </Text>
        <RadioButton
          value="wallet"
          status={paymentSource === "wallet" ? "checked" : "unchecked"}
          onPress={() => {
            setPaymentSource("wallet");
            setSelectedCardId(null);
          }}
          color="#7C3AED"
        />
      </TouchableOpacity>

      {/* Cards */}
      {loadingCards ? (
        <ActivityIndicator style={{ marginVertical: 12 }} />
      ) : cards.length > 0 ? (
        cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.sourceCard,
              paymentSource === "card" &&
                selectedCardId === card.id &&
                styles.sourceCardActive,
            ]}
            onPress={() => {
              setPaymentSource("card");
              setSelectedCardId(card.id);
            }}
          >
            <MaterialCommunityIcons
              name="credit-card"
              size={22}
              color={
                paymentSource === "card" && selectedCardId === card.id
                  ? "#7C3AED"
                  : "#64748B"
              }
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.sourceText,
                  paymentSource === "card" &&
                    selectedCardId === card.id &&
                    styles.sourceTextActive,
                ]}
              >
                Virtual Card •••• {card.last4 || card.card_number?.slice(-4)}
              </Text>
              <Text style={styles.cardBalance}>
                Balance: ₦
                {Number(card.balance || 0).toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
            <RadioButton
              value={String(card.id)}
              status={
                paymentSource === "card" && selectedCardId === card.id
                  ? "checked"
                  : "unchecked"
              }
              onPress={() => {
                setPaymentSource("card");
                setSelectedCardId(card.id);
              }}
              color="#7C3AED"
            />
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noCards}>No active virtual cards available</Text>
      )}

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Button
        mode="contained"
        onPress={handlePay}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Pay Now
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  inner: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 20,
  },
  input: { marginBottom: 14 },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
    marginTop: 8,
    marginBottom: 10,
  },
  sourceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  sourceCardActive: {
    borderColor: "#7C3AED",
    backgroundColor: "#F5F3FF",
  },
  sourceText: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "500",
  },
  sourceTextActive: {
    color: "#7C3AED",
    fontWeight: "600",
  },
  cardBalance: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  noCards: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 12,
    fontStyle: "italic",
  },
  button: { marginTop: 16, borderRadius: 10, paddingVertical: 4 },
});
