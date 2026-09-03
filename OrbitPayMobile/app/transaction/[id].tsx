import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import axiosClient from "../../src/api/axiosClient";

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        let res;
        try {
          res = await axiosClient.get(`transactions/${id}/`);
        } catch {
          res = await axiosClient.get(`transactions/${id}`);
        }
        setTransaction(res.data);
      } catch (error) {
        console.log("Transaction detail error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTransaction();
  }, [id]);

  const copyReference = async () => {
    const ref = transaction?.reference_id || transaction?.reference || "";
    if (!ref) return;
    await Clipboard.setStringAsync(ref);
    if (Platform.OS === "web") window.alert("Reference ID copied");
    else Alert.alert("Copied", "Reference ID copied to clipboard");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#94A3B8" />
        <Text style={styles.errorText}>Transaction not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const type = (transaction.type || transaction.transaction_type || "").toLowerCase();
  const description = (transaction.description || transaction.note || "").toLowerCase();
  const category = (transaction.category || "other").toLowerCase();

  const isCredit =
    type === "credit" ||
    type === "fund" ||
    type === "receive" ||
    type === "funding" ||
    type === "referral_bonus" ||
    description.includes("received") ||
    description.includes("wallet funding") ||
    description.includes("funded");

  const status = (transaction.status || "success").toLowerCase();
  const statusColor =
    status === "success" || status === "successful" || status === "completed"
      ? "#16A34A"
      : status === "pending"
      ? "#D97706"
      : "#DC2626";

  const currency = (
    transaction.currency ||
    transaction.currency_code ||
    "NGN"
  ).toUpperCase();
  const symbol =
    currency === "GBP" ? "£" : currency === "EUR" ? "€" : currency === "USD" ? "$" : "₦";
  const isFx =
    type === "convert" ||
    description.includes("convert") ||
    description.includes("fx ") ||
    Boolean(transaction.simulated);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
      </TouchableOpacity>

      <View style={styles.amountCard}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: isCredit ? "#DCFCE7" : "#FEE2E2" },
          ]}
        >
          <MaterialCommunityIcons
            name={isCredit ? "arrow-down" : "arrow-up"}
            size={28}
            color={isCredit ? "#16A34A" : "#DC2626"}
          />
        </View>

        <Text style={styles.amountLabel}>
          {isCredit ? "Money Received" : "Money Sent"}
        </Text>

        <Text
          style={[
            styles.amount,
            { color: isCredit ? "#16A34A" : "#DC2626" },
          ]}
        >
          {isCredit ? "+" : "-"}
          {symbol}
          {Number(transaction.amount).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
          })}
        </Text>

        <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {(transaction.status || "SUCCESS").toUpperCase()}
          </Text>
        </View>

        <Text style={[styles.railTag, isFx ? styles.simTag : styles.liveTag]}>
          {isFx ? "SIMULATED" : "LIVE · NGN RAIL"}
        </Text>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Transaction Details</Text>

        <DetailRow
          label="Reference"
          value={transaction.reference_id || transaction.reference || "—"}
          onCopy={copyReference}
        />
        <DetailRow
          label="Type"
          value={(transaction.type || transaction.transaction_type || "—").toUpperCase()}
        />
        <DetailRow
          label="Category"
          value={category.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
        />
        <DetailRow
          label="Description"
          value={transaction.description || transaction.note || "—"}
        />
        <DetailRow label="Currency" value={currency} />
        <DetailRow
          label="Rail"
          value={isFx ? "Sandbox FX" : "OrbitPay NGN"}
        />
        {transaction.rate || transaction.exchange_rate ? (
          <DetailRow
            label="Rate"
            value={String(transaction.rate || transaction.exchange_rate)}
          />
        ) : null}
        {transaction.fee ? (
          <DetailRow label="Fee" value={String(transaction.fee)} />
        ) : null}
        {transaction.from_currency && transaction.to_currency ? (
          <DetailRow
            label="Corridor"
            value={`${transaction.from_currency} → ${transaction.to_currency}`}
          />
        ) : null}
        <DetailRow
          label="Date"
          value={
            transaction.created_at
              ? new Date(transaction.created_at).toLocaleString("en-NG", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "—"
          }
        />
        {transaction.recipient_username && (
          <DetailRow label="Recipient" value={transaction.recipient_username} />
        )}
        {transaction.sender_username && (
          <DetailRow label="Sender" value={transaction.sender_username} />
        )}
      </View>
    </ScrollView>
  );
}

function DetailRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value} numberOfLines={2}>
          {value}
        </Text>
        {onCopy && (
          <TouchableOpacity onPress={onCopy} style={styles.copyBtn}>
            <MaterialCommunityIcons name="content-copy" size={16} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  inner: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  backButton: { marginBottom: 16 },
  amountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  amountLabel: { fontSize: 14, color: "#64748B", marginBottom: 4 },
  amount: { fontSize: 34, fontWeight: "700" },
  statusBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  railTag: { marginTop: 10, fontWeight: "700", fontSize: 12 },
  liveTag: { color: "#15803D" },
  simTag: { color: "#B45309" },
  detailsCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  label: { fontSize: 14, color: "#64748B", flex: 1 },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1.5,
    justifyContent: "flex-end",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
    textAlign: "right",
  },
  copyBtn: { marginLeft: 8, padding: 4 },
  errorText: { fontSize: 16, color: "#64748B", marginTop: 12 },
  backBtn: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 20 },
  backLink: { color: "#0284C7", fontWeight: "600", fontSize: 15 },
});