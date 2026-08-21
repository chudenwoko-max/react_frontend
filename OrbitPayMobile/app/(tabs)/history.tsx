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
  category?: string;
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  income: { bg: "#DCFCE7", text: "#16A34A" },
  transfer_received: { bg: "#DCFCE7", text: "#16A34A" },
  transfer_sent: { bg: "#FEE2E2", text: "#DC2626" },
  withdraw: { bg: "#FFEDD5", text: "#EA580C" },
  airtime: { bg: "#DBEAFE", text: "#2563EB" },
  data: { bg: "#DBEAFE", text: "#2563EB" },
  electricity: { bg: "#F3E8FF", text: "#7C3AED" },
  cable: { bg: "#F3E8FF", text: "#7C3AED" },
  bills: { bg: "#F3E8FF", text: "#7C3AED" },
  food: { bg: "#FEF3C7", text: "#D97706" },
  transport: { bg: "#E0E7FF", text: "#4F46E5" },
  shopping: { bg: "#FCE7F3", text: "#DB2777" },
  savings: { bg: "#CCFBF1", text: "#0D9488" },
  other: { bg: "#F1F5F9", text: "#64748B" },
};

const formatCategory = (cat?: string) => {
  if (!cat) return "Other";
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function HistoryScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const fetchTransactions = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await axiosClient.get("transactions/", {
        params: {
          page: pageNumber,
          page_size: 10,
        },
      });

      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setTransactions(data);

      // Handle both DRF pagination styles
      if (res.data.count !== undefined) {
        const total = Math.ceil(res.data.count / 10);
        setTotalPages(total || 1);
        setHasNext(!!res.data.next);
        setHasPrev(!!res.data.previous);
      } else {
        setTotalPages(1);
        setHasNext(false);
        setHasPrev(false);
      }

      setPage(pageNumber);
    } catch (error) {
      console.log("History error:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions(1);
  };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchTransactions(newPage);
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const type = (item.type || item.transaction_type || "").toLowerCase();
    const description = (item.description || item.note || "").toLowerCase();
    const category = (item.category || "other").toLowerCase();

    const isCredit =
      type === "credit" ||
      type === "fund" ||
      type === "receive" ||
      type === "funding" ||
      type === "referral_bonus" ||
      description.includes("received") ||
      description.includes("wallet funding") ||
      description.includes("funded");

    const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;

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

            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                <Text style={[styles.badgeText, { color: colors.text }]}>
                  {formatCategory(category)}
                </Text>
              </View>
              <Text style={styles.date}>
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString()
                  : "—"}
              </Text>
            </View>
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

  if (loading && !refreshing) {
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
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="history" size={40} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>
              Your transaction history will appear here once you start sending,
              receiving or funding money.
            </Text>
          </View>
        }
      />

      {/* Pagination Controls */}
      {transactions.length > 0 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageBtn, !hasPrev && styles.pageBtnDisabled]}
            onPress={() => goToPage(page - 1)}
            disabled={!hasPrev}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={22}
              color={hasPrev ? "#0F172A" : "#CBD5E1"}
            />
            <Text style={[styles.pageBtnText, !hasPrev && { color: "#CBD5E1" }]}>
              Prev
            </Text>
          </TouchableOpacity>

          <Text style={styles.pageInfo}>
            Page {page} of {totalPages}
          </Text>

          <TouchableOpacity
            style={[styles.pageBtn, !hasNext && styles.pageBtnDisabled]}
            onPress={() => goToPage(page + 1)}
            disabled={!hasNext}
          >
            <Text style={[styles.pageBtnText, !hasNext && { color: "#CBD5E1" }]}>
              Next
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={hasNext ? "#0F172A" : "#CBD5E1"}
            />
          </TouchableOpacity>
        </View>
      )}
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
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  date: {
    fontSize: 12,
    color: "#94A3B8",
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
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  pageBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pageBtnDisabled: {
    backgroundColor: "#F1F5F9",
  },
  pageBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
});