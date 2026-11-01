import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { router } from "expo-router";
import axiosClient from "../src/api/axiosClient";

const FEE_RATE = 0.005;
const TTL_MS = 30_000;

type RateRow = { from: string; to: string; rate: string };

export default function SendCorridorScreen() {
  const [source, setSource] = useState("GBP");
  const [target, setTarget] = useState("NGN");
  const [amount, setAmount] = useState("");
  const [rates, setRates] = useState<RateRow[]>([]);
  const [fetchedAt, setFetchedAt] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadRates = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.get("wallets/rates/");
      const rows = Array.isArray(res.data) ? res.data : res.data.rates || [];
      setRates(rows);
      setFetchedAt(Date.now());
    } catch {
      setError("Could not load rates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  const rate = useMemo(() => {
    const row = rates.find(
      (r) => r.from === source && r.to === target
    );
    const n = Number(row?.rate);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [rates, source, target]);

  const numericAmount = Number(amount);
  const fee =
    Number.isFinite(numericAmount) && numericAmount > 0
      ? numericAmount * FEE_RATE
      : 0;
  const net = Math.max(numericAmount - fee, 0);
  const payout = rate && net ? net * rate : 0;
  const expired = fetchedAt > 0 && Date.now() - fetchedAt > TTL_MS;

  const swap = () => {
    setSource(target);
    setTarget(source);
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Send abroad</Text>
      <Text style={styles.sub}>Sandbox quote. Not a live payout.</Text>

      <View style={styles.pair}>
        <Text style={styles.pairTxt}>
          {source} → {target}
        </Text>
        <TouchableOpacity onPress={swap}>
          <Text style={styles.link}>Swap</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        label={`Amount (${source})`}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
      />

      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.k}>Rate</Text>
        <Text style={styles.v}>
          {rate ? `1 ${source} = ${rate.toFixed(4)} ${target}` : "—"}
        </Text>
        <Text style={styles.k}>Fee (0.5%)</Text>
        <Text style={styles.v}>
          {fee ? `${fee.toFixed(2)} ${source}` : "—"}
        </Text>
        <Text style={styles.k}>Recipient gets</Text>
        <Text style={styles.payout}>
          {payout ? `${payout.toFixed(2)} ${target}` : "—"}
        </Text>
        <Text style={styles.sim}>SIMULATED · expires in 30s</Text>
        {expired ? (
          <Text style={styles.warn}>Quote stale. Refresh rates.</Text>
        ) : null}
      </View>

      <Button mode="outlined" onPress={loadRates} loading={loading} style={styles.btn}>
        Refresh quote
      </Button>
      <Button
        mode="contained"
        disabled
        style={styles.btn}
        onPress={() => {}}
      >
        Payout not live
      </Button>
      <Button mode="text" onPress={() => router.back()}>
        Back
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#F8FAFC" },
  inner: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "700", color: "#0F172A" },
  sub: { color: "#64748B", marginTop: 6, marginBottom: 20 },
  pair: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pairTxt: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  link: { color: "#2563EB", fontWeight: "600" },
  input: { marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  k: { color: "#64748B", marginTop: 8 },
  v: { color: "#0F172A", fontWeight: "600", fontSize: 16 },
  payout: { fontSize: 22, fontWeight: "700", color: "#0F172A", marginTop: 4 },
  sim: { marginTop: 12, color: "#B45309", fontWeight: "700" },
  warn: { marginTop: 8, color: "#B91C1C" },
  btn: { marginBottom: 8 },
});