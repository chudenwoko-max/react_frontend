import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
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
import axiosClient from "../../src/api/axiosClient";

type Transaction = {
  id: number;
  reference_id?: string;
  amount: string | number;
  transaction_type?: string;
  type?: string;
  status?: string;
  created_at?: string;
  description?: string;
  note?: string;
};

export default function HistoryScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await axiosClient.get("transactions/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setTransactions(data);
    } catch (error) {
      console.log("History error:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const type = (item.type || item.transaction_type || "").toLowerCase();
    const description = (item.description || item.note || "").toLowerCase();

    const isCredit =
      type === "credit" ||
      type === "fund" ||
      type === "receive" ||
      type === "funding" ||
      type === "referral_bonus" ||
      description.includes("received") ||
      description.includes("wallet funding") ||
      description.includes("funded");

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push(`/transaction/${item.id || item.reference_id}`)
        }
        activeOpacity={0.7}
      >
        <View style={styles.row}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: isCredit ? "#DCFCE7" : "#FEE2E2" },
            ]}
          >
            <MaterialCommunityIcons
              name={isCredit ? "arrow-down" : "arrow-up"}
              size={20}
              color={isCredit ? "#16A34A" : "#DC2626"}
            />
          </View>

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {item.description ||
                item.note ||
                item.transaction_type ||
                item.type ||
                "Transaction"}
            </Text>
            <Text style={styles.date}>
              {item.created_at
                ? new Date(item.created_at).toLocaleDateString()
                : "—"}
            </Text>
          </View>

          <Text
            style={[
              styles.amount,
              { color: isCredit ? "#16A34A" : "#DC2626" },
            ]}
          >
            {isCredit ? "+" : "-"}₦
            {Number(item.amount).toLocaleString("en-NG", {
              minimumFractionDigits: 2,
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction History</Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) =>
          item.id?.toString() || item.reference_id || Math.random().toString()
        }
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons
                name="history"
                size={40}
                color="#94A3B8"
              />
            </View>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>
              Your transaction history will appear here once you start sending,
              receiving or funding money.
            </Text>
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
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  date: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
});