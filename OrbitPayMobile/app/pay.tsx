import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import axiosClient from "../src/api/axiosClient";

type Card = { id: number; last4: string; brand?: string };

export default function PayMerchantScreen() {
  const [merchantId, setMerchantId] = useState("1");
  const [amount, setAmount] = useState("200");
  const [cards, setCards] = useState<Card[]>([]);
  const [cardId, setCardId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    axiosClient
      .get("me/cards/")
      .then((r) => setCards(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCards([]));
  }, []);

  const goHome = () => router.replace("/(tabs)");

  const payWallet = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await axiosClient.post("merchant/pay-wallet/", {
        merchant_id: Number(merchantId),
        amount,
        description: "Wallet pay",
      });
      Alert.alert("Paid", "Wallet payment sent", [{ text: "OK", onPress: goHome }]);
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.error || "Wallet pay failed");
    } finally {
      setBusy(false);
    }
  };

  const payCheckout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await axiosClient.post("merchant/pay-checkout/", {
        merchant_id: Number(merchantId),
        amount,
        description: "Save card + pay",
      });
      const url = res.data?.authorization_url;
      if (!url) throw new Error("No checkout URL");
      router.push({ pathname: "/fund", params: { url } });
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.error || "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  const payCard = async () => {
    if (busy || !cardId) return;
    setBusy(true);
    try {
      await axiosClient.post("merchant/pay-card/", {
        merchant_id: Number(merchantId),
        card_id: cardId,
        amount,
      });
      Alert.alert("Paid", "Charged saved card", [{ text: "OK", onPress: goHome }]);
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.error || "Card pay failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Pay a business</Text>
      <Text style={styles.hint}>Use a customer account, not the shop owner.</Text>

      <Text style={styles.label}>Merchant id</Text>
      <TextInput style={styles.input} value={merchantId} onChangeText={setMerchantId} keyboardType="number-pad" />

      <Text style={styles.label}>Amount</Text>
      <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />

      <TouchableOpacity style={styles.btn} onPress={payWallet} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Pay with wallet</Text>}
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
          <Text>
            {(c.brand || "Card") + " •••• " + c.last4}
          </Text>
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