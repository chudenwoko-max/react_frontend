import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { isAxiosError } from "axios";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import axiosClient from "../../src/api/axiosClient";

type Transaction = {
  id?: number | string;
  reference_id?: string;
  amount?: number | string;
  direction?: string;
  type?: string;
  transaction_type?: string;
  category?: string;
  description?: string;
  note?: string;
  kind?: string;
  created_at?: string;
  date?: string;
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && formatDate(date) === value;
}

function isCreditTransaction(transaction: Transaction) {
  const direction = transaction.direction?.toLowerCase();
  if (direction === "credit") return true;
  if (direction === "debit") return false;

  const type = (
    transaction.type ||
    transaction.transaction_type ||
    transaction.category ||
    transaction.kind ||
    ""
  ).toLowerCase();
  const description = (
    transaction.description ||
    transaction.note ||
    ""
  ).toLowerCase();

  return (
    ["credit", "fund", "receive", "funding", "income", "transfer_received"].includes(type) ||
    description.includes("received") ||
    description.includes("wallet funding") ||
    description.includes("funded")
  );
}

function transactionRows(data: unknown): Transaction[] {
  if (Array.isArray(data)) return data as Transaction[];
  if (data && typeof data === "object") {
    const response = data as {
      results?: unknown;
      transactions?: unknown;
    };
    if (Array.isArray(response.results)) return response.results as Transaction[];
    if (Array.isArray(response.transactions)) return response.transactions as Transaction[];
  }
  return [];
}

export default function Statement() {
  const today = new Date();
  const [from, setFrom] = useState(formatDate(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [to, setTo] = useState(formatDate(today));
  const [rows, setRows] = useState<Transaction[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!isValidDate(from) || !isValidDate(to) || from > to) {
      Alert.alert("Invalid period", "Enter valid dates in YYYY-MM-DD format, with the start date on or before the end date.");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.get("transactions/", {
        params: { from, to },
      });
      setRows(transactionRows(response.data));
      setHasGenerated(true);
    } catch (error) {
      const data = isAxiosError<{ error?: string; detail?: string }>(error)
        ? error.response?.data
        : null;
      const message =
        data?.error || data?.detail || "Could not load statement";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWithTabBar>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/payhost-logo.png")}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Payhost logo"
          />
          <Text style={styles.brand}>PAYHOST</Text>
        </View>
        <Text style={styles.title}>Statement of Account</Text>
        <Text style={styles.sub}>Choose a period for your statement.</Text>

        <View style={styles.period}>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>From</Text>
            <TextInput
              accessibilityLabel="Statement start date"
              style={styles.dateInput}
              value={from}
              onChangeText={setFrom}
              placeholder="YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
          </View>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>To</Text>
            <TextInput
              accessibilityLabel="Statement end date"
              style={styles.dateInput}
              value={to}
              onChangeText={setTo}
              placeholder="YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.disabledBtn]}
          onPress={load}
          disabled={loading}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnText}>Generate statement</Text>
          )}
        </TouchableOpacity>

        {hasGenerated && (
          <>
            <Text style={styles.periodSummary}>Period: {from} to {to}</Text>
            {rows.map((transaction, index) => {
              const credit = isCreditTransaction(transaction);
              const amount = Number(transaction.amount);
              const date = transaction.created_at?.slice(0, 10) || transaction.date || "—";
              return (
                <View
                  key={transaction.id || transaction.reference_id || `${date}-${index}`}
                  style={styles.row}
                >
                  <Text style={styles.date}>{date}</Text>
                  <Text style={styles.desc} numberOfLines={2}>
                    {transaction.description ||
                      transaction.note ||
                      transaction.kind ||
                      transaction.type ||
                      "Transaction"}
                  </Text>
                  <Text style={[styles.amt, credit ? styles.credit : styles.debit]}>
                    {credit ? "+" : "-"}₦
                    {Number.isFinite(amount)
                      ? amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })
                      : transaction.amount ?? "0.00"}
                  </Text>
                </View>
              );
            })}
            {rows.length === 0 && (
              <Text style={styles.empty}>No transactions found for this period.</Text>
            )}
          </>
        )}

        {!hasGenerated && !loading && (
          <Text style={styles.empty}>Choose a period and tap Generate to load your statement.</Text>
        )}
      </ScrollView>
    </ScreenWithTabBar>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  logo: { width: 40, height: 40, marginRight: 8 },
  brand: { fontSize: 20, fontWeight: "700", letterSpacing: 1, color: "#0F172A" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 4, color: "#0F172A" },
  sub: { color: "#64748B", marginBottom: 16 },
  period: { flexDirection: "row", gap: 12, marginBottom: 16 },
  dateField: { flex: 1 },
  dateLabel: { color: "#475569", fontSize: 13, fontWeight: "600", marginBottom: 6 },
  dateInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    color: "#0F172A",
    paddingHorizontal: 10,
    paddingVertical: 11,
  },
  btn: {
    backgroundColor: "#0F172A",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  disabledBtn: { opacity: 0.7 },
  btnText: { color: "#FFFFFF", fontWeight: "600" },
  periodSummary: { color: "#64748B", marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  date: { width: 84, color: "#64748B", fontSize: 12 },
  desc: { flex: 1, marginHorizontal: 8, color: "#0F172A" },
  amt: { fontWeight: "600", color: "#0F172A" },
  credit: { color: "#16A34A" },
  debit: { color: "#DC2626" },
  empty: { textAlign: "center", color: "#94A3B8", marginTop: 20 },
});
