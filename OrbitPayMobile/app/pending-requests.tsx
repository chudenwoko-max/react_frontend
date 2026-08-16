import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axiosClient from "../src/api/axiosClient";
import { router } from "expo-router";

type MoneyRequest = {
  id: number;
  requester: string;
  amount: string;
  note?: string;
  status: string;
  created_at: string;
};

export default function PendingRequestsScreen() {
  const [requests, setRequests] = useState<MoneyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await axiosClient.get("request-money/received/");
      // Adjust if the endpoint name is slightly different
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setRequests(data.filter((r: MoneyRequest) => r.status === "pending"));
    } catch (error) {
      console.log("Pending requests error:", error);
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handlePay = async (id: number) => {
    try {
      const res = await axiosClient.post(`request-money/${id}/pay/`);
      window.alert(res.data.message || "Payment successful!");
      fetchRequests();
    } catch (error: any) {
      console.log(error.response?.data);
      window.alert(error.response?.data?.error || "Failed to pay request");
    }
  };

  const handleDecline = async (id: number) => {
    try {
      await axiosClient.post(`request-money/${id}/decline/`);
      window.alert("Request declined");
      fetchRequests();
    } catch (error: any) {
      console.log(error.response?.data);
      window.alert(error.response?.data?.error || "Failed to decline");
    }
  };

  const renderItem = ({ item }: { item: MoneyRequest }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.requester?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{item.requester}</Text>
          <Text style={styles.date}>{item.created_at}</Text>
        </View>
        <Text style={styles.amount}>₦{Number(item.amount).toLocaleString()}</Text>
      </View>

      {item.note ? <Text style={styles.note}>{item.note}</Text> : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.payBtn]}
          onPress={() => handlePay(item.id)}
        >
          <Text style={styles.payText}>Pay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.declineBtn]}
          onPress={() => handleDecline(item.id)}
        >
          <Text style={styles.declineText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Pending Requests</Text>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="cash-remove"
              size={48}
              color="#CBD5E1"
            />
            <Text style={styles.emptyText}>No pending requests</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  date: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  note: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 12,
    marginLeft: 56,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  payBtn: {
    backgroundColor: "#16A34A",
  },
  declineBtn: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  payText: {
    color: "#FFF",
    fontWeight: "600",
  },
  declineText: {
    color: "#DC2626",
    fontWeight: "600",
  },
  empty: {
    alignItems: "center",
    marginTop: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: "#94A3B8",
  },
});