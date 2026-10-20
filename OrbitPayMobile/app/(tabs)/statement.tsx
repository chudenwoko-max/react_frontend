// CHANGE: Zenith-style Statement of Account with calendar date pickers
import { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

const axiosClient = {
  get: async (path: string, { params }: { params: Record<string, string> }) => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!baseUrl) throw new Error("EXPO_PUBLIC_API_URL is not configured");

    const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    const response = await fetch(url.toString(), { credentials: "include" });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return { data };
  },
};

export default function Statement() {
  const [from, setFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [to, setTo] = useState(new Date());
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("transactions/", {
        params: { from: fmt(from), to: fmt(to) },
      });
      setRows(res.data.results || res.data || []);
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.error || "Could not load statement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWithTabBar>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with logo */}
        <View style={styles.header}>
          <Image source={require("../../assets/payhost-logo.png")} style={styles.logo} />
          <View>
            <Text style={styles.brand}>PAYHOST</Text>
            <Text style={styles.account}>Statement of Account</Text>
          </View>
        </View>

        {/* Date range — calendar style */}
        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateBox} onPress={() => setShowFrom(true)}>
            <Text style={styles.dateLabel}>From</Text>
            <Text style={styles.dateValue}>{fmt(from)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dateBox} onPress={() => setShowTo(true)}>
            <Text style={styles.dateLabel}>To</Text>
            <Text style={styles.dateValue}>{fmt(to)}</Text>
          </TouchableOpacity>
        </View>

        {showFrom && (
          <DateTimePicker
            value={from}
            mode="date"
            onChange={(_, d) => { setShowFrom(false); if (d) setFrom(d); }}
          />
        )}
        {showTo && (
          <DateTimePicker
            value={to}
            mode="date"
            onChange={(_, d) => { setShowTo(false); if (d) setTo(d); }}
          />
        )}

        <TouchableOpacity style={styles.btn} onPress={load} disabled={loading}>
          <Text style={styles.btnText}>{loading ? "Generating…" : "Generate Statement"}</Text>
        </TouchableOpacity>

        {/* Transaction table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 1.2 }]}>Date</Text>
          <Text style={[styles.th, { flex: 2 }]}>Narration</Text>
          <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>Amount</Text>
        </View>

        {rows.map((tx, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.td, { flex: 1.2 }]}>{(tx.created_at || "").slice(0, 10)}</Text>
            <Text style={[styles.td, { flex: 2 }]} numberOfLines={1}>{tx.description || tx.kind || "—"}</Text>
            <Text style={[styles.td, { flex: 1, textAlign: "right", color: tx.direction === "credit" ? "#16A34A" : "#DC2626" }]}>
              {tx.direction === "credit" ? "+" : "-"}₦{Number(tx.amount).toLocaleString()}
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