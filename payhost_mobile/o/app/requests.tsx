import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
  DeviceEventEmitter,
} from "react-native";
import { Button } from "react-native-paper";
import { useFocusEffect } from "expo-router";
import axiosClient from "../src/api/axiosClient";
import { getOrCreateReferenceId } from "../src/utils/idempotency";
import { FINANCIALS_REFRESH } from "../src/notifications/refreshOnPush";

function rowsFrom(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.requests)) return data.requests;
  return [];
}

export default function RequestsScreen() {
  const [received, setReceived] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [r, s] = await Promise.all([
        axiosClient.get("request-money/received/"),
        axiosClient.get("request-money/sent/"),
      ]);
      setReceived(rowsFrom(r.data));
      setSent(rowsFrom(s.data));
    } catch (e: any) {
      setError(e?.response?.data?.error || "Could not load requests.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const pay = async (item: any) => {
    const id = item.id;
    setBusyId(id);
    try {
      const reference_id = await getOrCreateReferenceId(`reqpay:${id}`);
      await axiosClient.post(`request-money/${id}/pay/`, { reference_id });
      DeviceEventEmitter.emit(FINANCIALS_REFRESH);
      if (Platform.OS === "web") window.alert("Payment successful.");
      else Alert.alert("Paid", "Payment successful.");
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.error || "Pay failed.";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Pay failed", msg);
    } finally {
      setBusyId(null);
    }
  };

  const decline = async (id: number) => {
    setBusyId(id);
    try {
      await axiosClient.post(`request-money/${id}/decline/`);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || "Decline failed.");
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (id: number) => {
    setBusyId(id);
    try {
      await axiosClient.post(`request-money/${id}/cancel/`);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || "Cancel failed.");
    } finally {
      setBusyId(null);
    }
  };

  const pendingIn = received.filter((x) => x.status === "pending");
  const pendingOut = sent.filter((x) => x.status === "pending");

  return (
    <ScrollView
      style={styles.wrap}
      contentContainerStyle={styles.inner}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <Text style={styles.title}>Requests</Text>
      {error ? <Text style={styles.err}>{error}</Text> : null}

      <Text style={styles.h}>Incoming</Text>
      {pendingIn.length === 0 ? (
        <Text style={styles.empty}>No pending incoming requests.</Text>
      ) : (
        pendingIn.map((item) => (
          <View key={`in-${item.id}`} style={styles.card}>
            <Text style={styles.amt}>₦{String(item.amount)}</Text>
            <Text style={styles.meta}>
              From {item.requester_username || item.requester || "user"}
            </Text>
            {item.note ? <Text style={styles.meta}>{item.note}</Text> : null}
            <View style={styles.row}>
              <Button
                mode="contained"
                onPress={() => pay(item)}
                loading={busyId === item.id}
                disabled={busyId != null}
                style={styles.btn}
              >
                Pay
              </Button>
              <Button
                mode="outlined"
                onPress={() => decline(item.id)}
                disabled={busyId != null}
                style={styles.btn}
              >
                Decline
              </Button>
            </View>
          </View>
        ))
      )}

      <Text style={styles.h}>Sent</Text>
      {pendingOut.length === 0 ? (
        <Text style={styles.empty}>No pending sent requests.</Text>
      ) : (
        pendingOut.map((item) => (
          <View key={`out-${item.id}`} style={styles.card}>
            <Text style={styles.amt}>₦{String(item.amount)}</Text>
            <Text style={styles.meta}>
              To {item.recipient_username || item.recipient || "user"}
            </Text>
            <Button
              mode="outlined"
              onPress={() => cancel(item.id)}
              disabled={busyId != null}
            >
              Cancel
            </Button>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#F8FAFC" },
  inner: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "700", color: "#0F172A", marginBottom: 16 },
  h: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginTop: 12, marginBottom: 8 },
  empty: { color: "#64748B", marginBottom: 12 },
  err: { color: "#B91C1C", marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  amt: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  meta: { color: "#64748B", marginTop: 4 },
  row: { flexDirection: "row", gap: 8, marginTop: 10 },
  btn: { flex: 1 },
});