import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect, router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axiosClient from "../../src/api/axiosClient";

type Transaction = {
  id?: number;
  reference_id?: string;
  amount: string | number;
  type?: string;
  transaction_type?: string;
  description?: string;
  note?: string;
  created_at?: string;
  category?: string;
};

const PAGE_SIZE = 20;

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
  other: { bg: "#F1F5F9", text: "#64748B" },
};

const formatCategory = (cat?: string) => {
  if (!cat) return "Other";
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

function isCreditTx(item: Transaction) {
  const type = (item.type || item.transaction_type || "").toLowerCase();
  const description = (item.description || item.note || "").toLowerCase();
  return (
    type === "credit" ||
    type === "fund" ||
    type === "receive" ||
    type === "funding" ||
    type === "referral_bonus" ||
    description.includes("received") ||
    description.includes("wallet funding") ||
    description.includes("funded")
  );
}

export default function HistoryScreen() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPage = async (nextPage: number, replace: boolean) => {
    const res = await axiosClient.get("transactions/", {
      params: {
        page: nextPage,
        page_size: PAGE_SIZE,
        search: searchQuery.trim() || undefined,
      },
    });

    const data = Array.isArray(res.data) ? res.data : res.data.results || [];
    const next =
      Boolean(res.data.next) ||
      (Array.isArray(res.data) ? false : data.length === PAGE_SIZE);

    setItems((prev) => (replace ? data : [...prev, ...data]));
    setPage(nextPage);
    setHasNext(next);
  };

  const loadFirst = async () => {
    try {
      setLoading(true);
      await fetchPage(1, true);
    } catch (e) {
      console.log("History load error:", e);
      setItems([]);
      setHasNext(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFirst();
    }, [searchQuery])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadFirst();
  };

  const onEndReached = async () => {
    if (!hasNext || loadingMore || loading) return;
    try {
      setLoadingMore(true);
      await fetchPage(page + 1, false);
    } catch (e) {
      console.log("History page error:", e);
    } finally {
      setLoadingMore(false);
    }
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const credit = isCreditTx(item);
    const category = (item.category || "other").toLowerCase();
    const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;

    return (
      <TouchableOpacity
        style={styles.txCard}
        activeOpacity={0.7}
        onPress={() =>
          router.push(`/transaction/${item.id || item.reference_id}`)
        }
      >
        <View
          style={[
            styles.txIcon,
            { backgroundColor: credit ? "#DCFCE7" : "#FEE2E2" },
          ]}
        >
          <MaterialCommunityIcons
            name={credit ? "arrow-down" : "arrow-up"}
            size={18}
            color={credit ? "#16A34A" : "#DC2626"}
          />
        </View>

        <View style={styles.txInfo}>
          <Text style={styles.txTitle} numberOfLines={1}>
            {item.description ||
              item.note ||
              item.type ||
              item.transaction_type ||
              "Transaction"}
          </Text>

          <View style={styles.txMetaRow}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.bg }]}>
              <Text style={[styles.categoryBadgeText, { color: colors.text }]}>
                {formatCategory(category)}
              </Text>
            </View>

            <Text style={styles.txDate}>
              {item.created_at
                ? new Date(item.created_at).toLocaleDateString()
                : "—"}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.txAmount,
            { color: credit ? "#16A34A" : "#DC2626" },
          ]}
        >
          {credit ? "+" : "-"}₦
          {Number(item.amount).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
          })}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Transaction History</Text>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor="#CBD5E1"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialCommunityIcons name="close" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {loading && items.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#0F172A" />
      ) : (
        <FlashList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            String(item.id || item.reference_id || index)
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="history" size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                style={{ marginVertical: 16 }}
                color="#64748B"
              />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#0F172A",
  },
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
    marginRight: 8,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  txMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  txDate: {
    fontSize: 12,
    color: "#94A3B8",
  },
  txAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptyCard: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 12,
    color: "#94A3B8",
    fontSize: 15,
  },
});
