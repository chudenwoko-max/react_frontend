// CHANGE: Zenith-style Statement of Account with calendar date pickers
import { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { isAxiosError } from "axios";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import axiosClient from "../../src/api/axiosClient";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

type Transaction = {
  id?: string | number;
  created_at?: string;
  description?: string;
  kind?: string;
  amount?: number | string;
  direction?: string;
};

type StatementResponse = {
  results?: Transaction[];
  transactions?: Transaction[];
};

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

export default function Statement() {
  const [from, setFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [to, setTo] = useState(new Date());
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (formatDate(from) > formatDate(to)) {
      Alert.alert("Invalid date range", "The start date must be on or before the end date.");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosClient.get("transactions/", {
        params: { from: formatDate(from), to: formatDate(to) },
      });
      const data = res.data as Transaction[] | StatementResponse;
      setRows(
        Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : Array.isArray(data.transactions)
              ? data.transactions
              : []
      );
    } catch (error) {
      const message =
        isAxiosError(error)
          ? error.response?.data?.error || error.message
          : undefined;
      Alert.alert("Error", message || "Could not load statement");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (rows.length === 0) {
      Alert.alert("No data", "Generate a statement first");
      return;
    }

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { display: flex; align-items: center; margin-bottom: 20px; }
            .logo { width: 50px; height: 50px; margin-right: 12px; }
            h1 { margin: 0; font-size: 22px; }
            .sub { color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border-bottom: 1px solid #eee; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f8f9fa; }
            .credit { color: #16A34A; }
            .debit { color: #DC2626; }
          </style>
        </head>
        <body>
          <div class="header">
            <img class="logo" src="https://payhost.dev/payhost-logo.png" />
            <div>
              <h1>PAYHOST</h1>
              <div class="sub">Statement of Account</div>
              <div class="sub">${formatDate(from)} to ${formatDate(to)}</div>
            </div>
          </div>
          <table>
            <tr><th>Date</th><th>Narration</th><th>Amount</th></tr>
            ${rows.map((tx) => {
              const amount = Number(tx.amount ?? 0);
              const isCredit = tx.direction
                ? tx.direction === "credit"
                : amount >= 0;
              const sign = tx.direction
                ? isCredit ? "+" : "-"
                : amount >= 0 ? "+" : "-";
              return `
                <tr>
                  <td>${escapeHtml(tx.created_at?.slice(0, 10) || "—")}</td>
                  <td>${escapeHtml(tx.description || tx.kind || "—")}</td>
                  <td class="${isCredit ? "credit" : "debit"}">
                    ${sign}₦${Math.abs(amount).toLocaleString()}
                  </td>
                </tr>
              `;
            }).join("")}
          </table>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Payhost Statement",
      });
    } catch {
      Alert.alert("Error", "Could not create PDF");
    }
  };

  return (
    <ScreenWithTabBar>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image source={require("../../assets/payhost-logo.png")} style={styles.logo} />
          <View>
            <Text style={styles.brand}>PAYHOST</Text>
            <Text style={styles.account}>Statement of Account</Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateBox} onPress={() => setShowFrom(true)}>
            <Text style={styles.dateLabel}>From</Text>
            <Text style={styles.dateValue}>{formatDate(from)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dateBox} onPress={() => setShowTo(true)}>
            <Text style={styles.dateLabel}>To</Text>
            <Text style={styles.dateValue}>{formatDate(to)}</Text>
          </TouchableOpacity>
        </View>

        {showFrom && (
          <DateTimePicker
            value={from}
            mode="date"
            onChange={(_, date) => {
              setShowFrom(false);
              if (date) setFrom(date);
            }}
          />
        )}
        {showTo && (
          <DateTimePicker
            value={to}
            mode="date"
            onChange={(_, date) => {
              setShowTo(false);
              if (date) setTo(date);
            }}
          />
        )}

        <TouchableOpacity style={styles.btn} onPress={load} disabled={loading}>
          <Text style={styles.btnText}>{loading ? "Generating…" : "Generate Statement"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#1E40AF", marginTop: 8 }]}
          onPress={downloadPdf}
        >
          <Text style={styles.btnText}>Download / Share PDF</Text>
        </TouchableOpacity>

        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 1.2 }]}>Date</Text>
          <Text style={[styles.th, { flex: 2 }]}>Narration</Text>
          <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>Amount</Text>
        </View>

        {rows.map((tx, i) => (
          <View key={tx.id ?? `${tx.created_at ?? "transaction"}-${i}`} style={styles.tableRow}>
            <Text style={[styles.td, { flex: 1.2 }]}>{tx.created_at?.slice(0, 10) || "—"}</Text>
            <Text style={[styles.td, { flex: 2 }]} numberOfLines={1}>{tx.description || tx.kind || "—"}</Text>
            <Text style={[styles.td, { flex: 1, textAlign: "right", color: tx.direction === "credit" ? "#16A34A" : "#DC2626" }]}>
              {tx.direction === "credit" ? "+" : "-"}₦{Number(tx.amount || 0).toLocaleString()}
            </Text>
          </View>
        ))}

        {rows.length === 0 && !loading && (
          <Text style={styles.empty}>Select dates and tap Generate</Text>
        )}
      </ScrollView>
    </ScreenWithTabBar>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  logo: { width: 48, height: 48, marginRight: 12 },
  brand: { fontSize: 18, fontWeight: "700", letterSpacing: 1 },
  account: { fontSize: 14, color: "#64748B" },
  dateRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  dateBox: { flex: 1, borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, padding: 12 },
  dateLabel: { fontSize: 12, color: "#64748B" },
  dateValue: { fontSize: 16, fontWeight: "600", marginTop: 2 },
  btn: { backgroundColor: "#0F172A", padding: 14, borderRadius: 8, alignItems: "center", marginBottom: 20 },
  btnText: { color: "#fff", fontWeight: "600" },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E2E8F0", paddingBottom: 8, marginBottom: 4 },
  th: { fontSize: 12, fontWeight: "700", color: "#64748B" },
  tableRow: { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  td: { fontSize: 14 },
  empty: { textAlign: "center", color: "#94A3B8", marginTop: 30 },
});