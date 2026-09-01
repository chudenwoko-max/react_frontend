import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import axiosClient from "../src/api/axiosClient";
import { DeviceEventEmitter } from "react-native";
import { FINANCIALS_REFRESH } from "../src/notifications/refreshOnPush";

export default function WithdrawPausedScreen() {
  const [pending, setPending] = useState<{
    reference: string;
    amount: string;
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const loadPending = async () => {
    try {
      const res = await axiosClient.get("wallet/snapshot/", { params: { range: "7d" } });
      setPending(res.data?.pending_withdraw || null);
    } catch {
      setPending(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const cancelPending = async () => {
    if (!pending?.reference) return;
    setCancelling(true);
    try {
      await axiosClient.post("wallet/withdraw/cancel/", {
        reference_id: pending.reference,
      });
      setPending(null);
      DeviceEventEmitter.emit(FINANCIALS_REFRESH);
    } catch (e) {
      console.log("Cancel withdraw error:", e);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="bank-off-outline" size={48} color="#94A3B8" />
      <Text style={styles.title}>Withdrawals paused</Text>
      <Text style={styles.body}>
        Bank payouts are unavailable on this Paystack account. Your NGN wallet
        still works for in-app sends and funding.
      </Text>

      {loading ? (
        <ActivityIndicator color="#0F172A" style={{ marginTop: 24 }} />
      ) : pending ? (
        <View style={styles.pendingCard}>
          <Text style={styles.pendingTitle}>On hold</Text>
          <Text style={styles.pendingBody}>
            ₦{Number(pending.amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}{" "}
            ({pending.status})
          </Text>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={cancelPending}
            disabled={cancelling}
          >
            <Text style={styles.cancelText}>
              {cancelling ? "Cancelling…" : "Cancel and refund"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace("/(tabs)")}>
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
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 16,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },
  pendingCard: {
    marginTop: 28,
    width: "100%",
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  pendingTitle: { fontSize: 16, fontWeight: "700", color: "#92400E", marginBottom: 6 },
  pendingBody: { fontSize: 14, color: "#78350F", marginBottom: 12 },
  cancelBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#0F172A",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  homeBtn: { marginTop: 32, padding: 12 },
  homeText: { fontSize: 16, fontWeight: "600", color: "#0284C7" },
});