import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  DeviceEventEmitter,
  Linking,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import axiosClient from "../src/api/axiosClient";
import { FINANCIALS_REFRESH } from "../src/notifications/refreshOnPush";

type Card = { id: number; last4: string; brand?: string };

function apiError(e: any, fallback: string) {
  const d = e?.response?.data;
  if (!d) return e?.message || fallback;
  if (typeof d === "string") return d;
  return d.error || d.detail || d.message || fallback;
}

export default function PayMerchantScreen() {
  const [merchantId, setMerchantId] = useState("1");
  const [amount, setAmount] = useState("200");
  const [pin, setPin] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [cardId, setCardId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [awaitingCheckout, setAwaitingCheckout] = useState(false);

  const loadCards = useCallback(async () => {
    try {
      const r = await axiosClient.get("me/cards/");
      const list: Card[] = Array.isArray(r.data) ? r.data : [];
      setCards(list);
      setCardId((prev) => {
        if (prev && list.some((c) => c.id === prev)) return prev;
        return list.length === 1 ? list[0].id : prev;
      });
    } catch {
      setCards([]);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const finishOk = useCallback(() => {
    setAwaitingCheckout(false);
    DeviceEventEmitter.emit(FINANCIALS_REFRESH);
    router.replace("/(tabs)");
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!awaitingCheckout) return;
      DeviceEventEmitter.emit(FINANCIALS_REFRESH);
      loadCards();
      setAwaitingCheckout(false);
      router.replace("/(tabs)");
    }, [awaitingCheckout, loadCards])
  );

  const parsedAmount = () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert("Error", "Enter a valid amount");
      return null;
    }
    return n;
  };

  const parsedMerchant = () => {
    const n = Number(merchantId);
    if (!Number.isInteger(n) || n <= 0) {
      Alert.alert("Error", "Enter a valid merchant id");
      return null;
    }
    return n;
  };

  const payWallet = async () => {
  if (busy) return;
  const merchant_id = parsedMerchant();
  const amt = parsedAmount();
  if (merchant_id == null || amt == null) return;

  // CHANGE: pay-wallet/ returned 400 because pin was absent.
  if (!pin) {
    Alert.alert("PIN required", "Enter your PIN");
    return;
  }

  setBusy(true);
  try {
    await axiosClient.post("merchant/pay-wallet/", {
      merchant_id,
      amount: amt,
      description: "Wallet pay",
      pin: String(pin),
    });
    finishOk();
  } catch (e: any) {
    Alert.alert("Error", apiError(e, "Wallet pay failed"));
    setBusy(false);
  }
};

  const payCheckout = async () => {
    if (busy) return;
    const merchant_id = parsedMerchant();
    const amt = parsedAmount();
    if (merchant_id == null || amt == null) return;
    setBusy(true);
    try {
      const res = await axiosClient.post("merchant/pay-checkout/", {
        merchant_id,
        amount: amt,
        description: "Save card + pay",
      });
      const url = res.data?.authorization_url;
      if (!url) throw new Error("No checkout URL");
      setAwaitingCheckout(true);
      await Linking.openURL(url);
    } catch (e: any) {
      setAwaitingCheckout(false);
      Alert.alert("Error", apiError(e, "Checkout failed"));
    } finally {
      setBusy(false);
    }
  };

  const payCard = async () => {
    if (busy || !cardId) return;
    const merchant_id = parsedMerchant();
    const amt = parsedAmount();
    if (merchant_id == null || amt == null) return;
    setBusy(true);
    try {
      await axiosClient.post("merchant/pay-card/", {
        merchant_id,
        card_id: cardId,
        amount: amt,
      });
      finishOk();
    } catch (e: any) {
      Alert.alert("Error", apiError(e, "Card pay failed"));
      setBusy(false);
    }
  };

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Pay a business</Text>
      <Text style={styles.hint}>Use a customer account, not the shop owner.</Text>

      <Text style={styles.label}>Merchant id</Text>
      <TextInput
        style={styles.input}
        value={merchantId}
        onChangeText={setMerchantId}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>PIN</Text>
      <TextInput
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        keyboardType="number-pad"
        secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={payWallet} disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Pay with wallet</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={payCheckout} disabled={busy}>
        <Text style={styles.btnText}>Pay with card (Paystack)</Text>
      </TouchableOpacity>

      {cards.map((c) => (
        <TouchableOpacity
          key={c.id}
          style={[styles.card, cardId === c.id && styles.cardOn]}
          onPress={() => setCardId(c.id)}
        >
          <Text>{(c.brand || "Card") + " •••• " + c.last4}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.btn, !cardId && { opacity: 0.4 }]}
        onPress={payCard}
        disabled={busy || !cardId}
      >
        <Text style={styles.btnText}>Pay with saved card</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, backgroundColor: "#F8FAFC", padding: 24, paddingTop: 64 },
  title: { fontSize: 24, fontWeight: "700", color: "#0F172A" },
  hint: { color: "#64748B", marginTop: 8, marginBottom: 20 },
  label: { fontSize: 13, color: "#334155", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  btn: {
    backgroundColor: "#0F172A",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  btnText: { color: "#fff", fontWeight: "700" },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  cardOn: { borderColor: "#0284C7", backgroundColor: "#E0F2FE" },
});