import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { Button, TextInput, HelperText } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axiosClient from "../src/api/axiosClient";

export default function ScheduledScreen() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransfers = async () => {
    try {
      const res = await axiosClient.get("scheduled/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setTransfers(data);
    } catch {
      setTransfers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTransfers(); }, []);

  const cancelTransfer = async (id: number) => {
    try {
      await axiosClient.post(`scheduled/${id}/cancel/`);
      fetchTransfers();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Failed");
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Scheduled Transfers</Text>
      <FlatList
        data={transfers}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTransfers(); }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="calendar-clock" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No scheduled transfers</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.recipient_username || item.recipient}</Text>
            <Text style={styles.amount}>₦{Number(item.amount).toLocaleString()}</Text>
            <Text style={styles.date}>{item.next_run || item.scheduled_date}</Text>
            <Button mode="outlined" onPress={() => cancelTransfer(item.id)} style={{ marginTop: 10 }}>
              Cancel
            </Button>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", paddingTop: 60, paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 20, color: "#0F172A" },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: "600" },
  amount: { fontSize: 18, fontWeight: "700", marginTop: 4 },
  date: { fontSize: 13, color: "#64748B", marginTop: 4 },
  empty: { alignItems: "center", marginTop: 80 },
  emptyText: { marginTop: 12, color: "#94A3B8" },
});