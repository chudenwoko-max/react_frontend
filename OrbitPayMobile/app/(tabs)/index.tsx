import { useFocusEffect } from "expo-router";
import { useCallback, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import axiosClient from "../../src/api/axiosClient";
import { router } from "expo-router";
import {
  BalanceCard,
  MonthSnapshot,
  WalletsGrid,
  QuickActions,
  WeeklyChart,
} from "../../src/components/dashboard/DashboardSections";
import { unregisterPushToken } from "../../src/notifications/push";
import { useEffect } from "react";
import { DeviceEventEmitter } from "react-native";
import { FINANCIALS_REFRESH } from "../../src/notifications/refreshOnPush";


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

const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonLineShort} />
    <View style={styles.skeletonLine} />
    <View style={styles.skeletonLineMedium} />
  </View>
);

const SkeletonTx = () => (
  <View style={styles.skeletonTxRow}>
    <View style={styles.skeletonCircle} />
    <View style={styles.skeletonTxLines}>
      <View style={styles.skeletonLineShort} />
      <View style={styles.skeletonLineMedium} />
    </View>
  </View>
);

export default function Dashboard() {
  const { logout } = useAuth();
  const [balance, setBalance] = useState<string>("₦ 0.00");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(FINANCIALS_REFRESH, () => {
      fetchUnreadCount();
      fetchBalance();
      fetchWallets();
      fetchWeeklySpend();
      fetchSnapshot("7d");
      fetchSnapshot("30d");
    });
    return () => sub.remove();
  }, []);


  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [monthSpent, setMonthSpent] = useState(0);
  const [monthReceived, setMonthReceived] = useState(0);
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [weeklyInsight, setWeeklyInsight] = useState<any>(null);
  const [savingsSuggestion, setSavingsSuggestion] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "sent" | "received" | "bills" | "others">("all");
  const [cashflowAlert, setCashflowAlert] = useState<any>(null);
  const isFirstLoad = useRef(true);

  const SPEND_TYPES = new Set([
  "transfer",
  "transfer_sent",
  "withdraw",
  "airtime",
  "data",
  "electricity",
  "cable",
  "bills",
  "debit",
]);

function bucketWeeklySpend(rows: any[]) {
  const buckets = [0, 0, 0, 0, 0, 0, 0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const tx of rows) {
    const type = String(tx.type || tx.transaction_type || "").toLowerCase();
    if (!SPEND_TYPES.has(type)) continue;

    const d = new Date(tx.created_at);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
    if (diff < 0 || diff > 6) continue;
    buckets[6 - diff] += Number(tx.amount) || 0;
  }
  return buckets;
}

const fetchWeeklySpend = async () => {
  try {
    const res = await axiosClient.get("transactions/", {
      params: { date_range: "7days", page_size: 50 },
    });
    const rows = res.data.results || res.data || [];
    setWeeklyData(bucketWeeklySpend(Array.isArray(rows) ? rows : []));
  } catch (e) {
    console.log("Weekly spend fetch error:", e);
  }
};

  const fetchSavingsSuggestion = async () => {
    try {
      const res = await axiosClient.get("savings/suggestions/");
      const list = Array.isArray(res.data) ? res.data : [];
      setSavingsSuggestion(list.length > 0 ? list[0] : null);
    } catch (error) {
      console.log("Savings suggestion error:", error);
      setSavingsSuggestion(null);
    }
  };

  const acceptSuggestion = async () => {
    if (!savingsSuggestion?.id) return;
    try {
      await axiosClient.post(`savings/suggestions/${savingsSuggestion.id}/accept/`);
      setSavingsSuggestion(null);
      await fetchSavingsGoals();
    } catch (error) {
      console.log("Accept suggestion error:", error);
    }
  };

  const dismissSuggestion = async () => {
    if (!savingsSuggestion?.id) return;
    try {
      await axiosClient.post(`savings/suggestions/${savingsSuggestion.id}/dismiss/`);
      setSavingsSuggestion(null);
    } catch (error) {
      console.log("Dismiss suggestion error:", error);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await axiosClient.get("wallet/balance/");
      const amount = res.data.balance ?? 0;
      setBalance(
        Number(amount).toLocaleString("en-NG", {
          style: "currency",
          currency: "NGN",
          minimumFractionDigits: 2,
        })
      );
    } catch (error) {
      console.log("Balance error:", error);
      setBalance("₦ 0.00");
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axiosClient.get("notifications/");
      const count = res.data.unread_count ?? 0;
      setUnreadCount(count);
    } catch (error) {
      setUnreadCount(0);
    }
  };

  const fetchSavingsGoals = async () => {
    try {
      const res = await axiosClient.get("savings/");
      const data = Array.isArray(res.data) ? res.data : [];
      setSavingsGoals(data.slice(0, 3));
    } catch (error) {
      setSavingsGoals([]);
    }
  };

  const fetchWallets = async () => {
    try {
      const res = await axiosClient.get("wallets/");
      const data = Array.isArray(res.data) ? res.data : [];
      setWallets(data);
    } catch (error) {
      console.log("Wallets error:", error);
      setWallets([]);
    }
  };

  const fetchRecentTransactions = async () => {
  try {
    const res = await axiosClient.get("transactions/", {
      params: { page: 1, page_size: 8 },
    });

    const data = Array.isArray(res.data)
      ? res.data
      : res.data.results || [];

    // Only update the recent list — no monthly calculations here
    setRecentTransactions(data);

  } catch (error) {
    console.log("Recent transactions error:", error);
    setRecentTransactions([]);
  }
};


    const fetchLatestInsight = async () => {
    try {
      const res = await axiosClient.get("insights/latest/");
      const weekly = res.data?.weekly || null;
      if (!weekly) {
        setWeeklyInsight(null);
        return;
      }
      setWeeklyInsight({
        title: weekly.title || "Orbit Insight · This week",
        message: weekly.body || weekly.message || "",
        save_reason: weekly.save_reason || "",
        suggested_save: weekly.suggested_save,
      });
    } catch (error) {
      console.log("Insight error:", error);
      setWeeklyInsight(null);
    }
  };

    const fetchSnapshot = async (range: "7d" | "30d" = "7d") => {
    try {
      const res = await axiosClient.get("wallet/snapshot/", { params: { range } });
      const data = res.data || {};
      setWeeklyData(
        Array.isArray(data.daily)
          ? data.daily.map((d: { spend?: number }) => Number(d.spend) || 0)
          : [0, 0, 0, 0, 0, 0, 0]
      );
      if (range === "30d") {
        setMonthSpent(Number(data.spend) || 0);
        setMonthReceived(Number(data.received) || 0);
      }
      if (range === "7d" && data) {
        setWeeklyInsight({
          title: "Orbit Insight · This week",
          message: `You spent ₦${Number(data.spend || 0).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
          })} in the last 7 days.`,
          save_reason: `Wallet balance ₦${Number(data.balance || 0).toLocaleString(
            "en-NG",
            { minimumFractionDigits: 2 }
          )}.`,
        });
      }
    } catch (e) {
      console.log("Snapshot error:", e);
    }
  };

  const fetchCashflowAlert = async () => {
    try {
      const res = await axiosClient.get("analytics/cashflow/");
      setCashflowAlert(res.data?.show ? res.data : null);
    } catch (error) {
      console.log("Cashflow error:", error);
      setCashflowAlert(null);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      fetchBalance(),
      fetchUnreadCount(),
      fetchRecentTransactions(),
      fetchSavingsGoals(),
      fetchWallets(),
      fetchLatestInsight(),
      fetchSavingsSuggestion(),
      fetchCashflowAlert(),
      fetchSnapshot("7d"),
      fetchSnapshot("30d"),
    ]);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        loadData();
fetchWeeklySpend();
fetchSnapshot("7d");
fetchSnapshot("30d");

      } else {
        Promise.all([
          fetchBalance(),
          fetchUnreadCount(),
          fetchWallets(),
          fetchWeeklySpend(),
          fetchLatestInsight(),
        ]);
      }
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
await fetchWeeklySpend();
await fetchSnapshot("7d");
await fetchSnapshot("30d");

    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await unregisterPushToken();
      await logout();
    } catch (e) {
      console.log(e);
    } finally {
      router.dismissAll();
      router.replace("/(auth)/login");
    }
  };

  const filteredTransactions = useMemo(() => {
    let filtered = recentTransactions;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          (tx.description || "").toLowerCase().includes(query) ||
          (tx.note || "").toLowerCase().includes(query) ||
          (tx.category || "").toLowerCase().includes(query)
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((tx) => {
        const type = (tx.type || tx.transaction_type || "").toLowerCase();
        const desc = (tx.description || tx.note || "").toLowerCase();
        const category = (tx.category || "").toLowerCase();

        const isCredit =
          type === "credit" ||
          type === "fund" ||
          type === "receive" ||
          type === "funding" ||
          type === "referral_bonus" ||
          desc.includes("received") ||
          desc.includes("wallet funding") ||
          desc.includes("funded");

        if (filterType === "sent")
          return !isCredit && !desc.includes("bill") && !desc.includes("withdraw") && type !== "withdraw";
        if (filterType === "received") return isCredit;
        if (filterType === "bills")
          return (
            desc.includes("bill") ||
            ["electricity", "cable", "data", "airtime"].includes(category)
          );
        if (filterType === "others")
          return (
            !isCredit &&
            !desc.includes("bill") &&
            !desc.includes("withdraw") &&
            type !== "withdraw" &&
            !["electricity", "cable", "data", "airtime"].includes(category)
          );
        return true;
      });
    }

    return filtered;
  }, [recentTransactions, searchQuery, filterType]);

  const renderTransaction = useCallback((item: Transaction) => {
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
        key={item.id || item.reference_id}
        style={styles.txCard}
        onPress={() => router.push(`/transaction/${item.id || item.reference_id}`)}
        activeOpacity={0.7}
      >
        <View style={[styles.txIcon, { backgroundColor: isCredit ? "#DCFCE7" : "#FEE2E2" }]}>
          <MaterialCommunityIcons
            name={isCredit ? "arrow-down" : "arrow-up"}
            size={18}
            color={isCredit ? "#16A34A" : "#DC2626"}
          />
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txTitle} numberOfLines={1}>
            {item.description || item.note || item.type || "Transaction"}
          </Text>
          <View style={styles.txMetaRow}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.bg }]}>
              <Text style={[styles.categoryBadgeText, { color: colors.text }]}>
                {formatCategory(category)}
              </Text>
            </View>
            <Text style={styles.txDate}>
              {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}
            </Text>
          </View>
        </View>
        <Text style={[styles.txAmount, { color: isCredit ? "#16A34A" : "#DC2626" }]}>
          {isCredit ? "+" : "-"}₦
          {Number(item.amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
        </Text>
      </TouchableOpacity>
    );
  }, []);

  return (
  <ScrollView
    style={styles.container}
    contentContainerStyle={{ paddingBottom: 40 }}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
  >
    <View style={styles.headerRow}>
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={() => router.push("/notifications")} style={styles.iconButton}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#0F172A" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>

    <BalanceCard balance={balance} loading={loading} />

    {loading ? (
      <>
        <SkeletonCard />
        <SkeletonCard />
      </>
    ) : (
      <>
        {weeklyInsight?.message ? (
  <View style={styles.insightCard}>
    <View style={styles.insightHeader}>
      <MaterialCommunityIcons
        name="lightbulb-on-outline"
        size={20}
        color="#F59E0B"
      />
      <Text style={styles.insightLabel}>Orbit Insight · This week</Text>
    </View>

    <Text style={styles.insightTitle}>{weeklyInsight.title}</Text>
    <Text style={styles.insightMessage}>{weeklyInsight.message}</Text>
  </View>
) : null}


                {(weeklyInsight?.save_reason || savingsSuggestion) && (
          <View style={styles.suggestionCard}>
            <View style={styles.insightHeader}>
              <MaterialCommunityIcons name="piggy-bank-outline" size={20} color="#0D9488" />
              <Text style={styles.suggestionLabel}>Smart Save</Text>
            </View>
            <Text style={styles.insightTitle}>
              {weeklyInsight?.suggested_save
                ? `Save ₦${Number(weeklyInsight.suggested_save).toLocaleString()} weekly`
                : savingsSuggestion
                ? `Save ₦${Number(savingsSuggestion.suggested_amount).toLocaleString()} weekly`
                : "Smart Save"}
            </Text>
            <Text style={styles.insightMessage}>
              {weeklyInsight?.save_reason || savingsSuggestion?.reason}
            </Text>
            {savingsSuggestion?.id ? (
              <View style={styles.suggestionActions}>
                <TouchableOpacity style={styles.acceptBtn} onPress={acceptSuggestion}>
                  <Text style={styles.acceptText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dismissBtn} onPress={dismissSuggestion}>
                  <Text style={styles.dismissText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}
        {cashflowAlert && (
          <View
            style={[
              styles.cashflowCard,
              cashflowAlert.status === "critical" ? styles.cashflowCritical : styles.cashflowWarning,
            ]}
          >
            <View style={styles.insightHeader}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={20}
                color={cashflowAlert.status === "critical" ? "#DC2626" : "#D97706"}
              />
              <Text
                style={[
                  styles.cashflowLabel,
                  { color: cashflowAlert.status === "critical" ? "#DC2626" : "#D97706" },
                ]}
              >
                Cash Flow Alert
              </Text>
            </View>
            <Text style={styles.insightTitle}>{cashflowAlert.title}</Text>
            <Text style={styles.insightMessage}>{cashflowAlert.message}</Text>
          </View>
        )}
      </>
    )}

    <MonthSnapshot monthSpent={monthSpent} monthReceived={monthReceived} />
    <WalletsGrid wallets={wallets} />
    <QuickActions />

    {/* ⭐ WEEKLY CHART — now using real weeklyData */}
    <WeeklyChart weeklyData={weeklyData} />

    {savingsGoals.length > 0 && (
      <>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Savings Goals</Text>
          <TouchableOpacity onPress={() => router.push("/savings")}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 28 }}>
          {savingsGoals.map((goal) => (
            <View key={goal.id} style={styles.goalCard}>
              <Text style={styles.goalTitle} numberOfLines={1}>
                {goal.title}
              </Text>
              <Text style={styles.goalAmount}>
                ₦{Number(goal.current_amount || 0).toLocaleString()} / ₦
                {Number(goal.target_amount || 0).toLocaleString()}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(Number(goal.progress || 0), 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.goalProgress}>{Math.round(Number(goal.progress || 0))}%</Text>
            </View>
          ))}
        </ScrollView>
      </>
    )}

    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {recentTransactions.length > 0 && (
        <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      )}
    </View>

    {recentTransactions.length > 0 && (
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor="#CBD5E1"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialCommunityIcons name="close" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
    )}

    {recentTransactions.length > 0 && (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
        {(["all", "sent", "received", "bills", "others"] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterTab, filterType === type && styles.filterTabActive]}
            onPress={() => setFilterType(type)}
          >
            <Text style={[styles.filterTabText, filterType === type && styles.filterTabTextActive]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )}

    {loading ? (
      <View style={{ marginTop: 8 }}>
        <SkeletonTx />
        <SkeletonTx />
        <SkeletonTx />
      </View>
    ) : recentTransactions.length === 0 ? (
      <View style={styles.emptyCard}>
        <MaterialCommunityIcons name="history" size={40} color="#CBD5E1" />
        <Text style={styles.emptyText}>No transactions yet</Text>
        <Text style={styles.emptySubText}>Fund your wallet or send money to see activity here.</Text>
      </View>
    ) : filteredTransactions.length === 0 ? (
      <View style={styles.emptyCard}>
        <MaterialCommunityIcons name="magnify" size={40} color="#CBD5E1" />
        <Text style={styles.emptyText}>No results found</Text>
        <Text style={styles.emptySubText}>Try adjusting your search or filters.</Text>
      </View>
    ) : (
      <View style={styles.txList}>{filteredTransactions.map(renderTransaction)}</View>
    )}
  </ScrollView>
);

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 20, paddingTop: 60 },
  headerRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginBottom: 20, gap: 16 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoutButton: { paddingVertical: 6, paddingHorizontal: 12 },
  iconButton: { padding: 6, position: "relative" },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  logoutText: { fontSize: 15, fontWeight: "600", color: "#DC2626" },
  insightCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  insightHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
  insightLabel: { fontSize: 14, fontWeight: "600", color: "#C2410C" },
  insightTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 6 },
  insightMessage: { fontSize: 14, lineHeight: 20, color: "#475569" },
  suggestionCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  suggestionLabel: { fontSize: 14, fontWeight: "600", color: "#0F766E" },
  cashflowCard: { borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1 },
  cashflowWarning: { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" },
  cashflowCritical: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  cashflowLabel: { fontSize: 14, fontWeight: "600" },
  suggestionActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 16 },
  acceptBtn: { backgroundColor: "#0D9488", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16 },
  acceptText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  dismissBtn: { backgroundColor: "#F1F5F9", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16 },
  dismissText: { color: "#475569", fontSize: 13, fontWeight: "600" },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#0F172A", marginBottom: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  seeAll: { fontSize: 14, color: "#0284C7", fontWeight: "600" },
  goalCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, width: 200, marginRight: 12 },
  goalTitle: { fontSize: 15, fontWeight: "600", color: "#0F172A", marginBottom: 8 },
  goalAmount: { fontSize: 13, color: "#64748B", marginBottom: 10 },
  progressBar: { height: 6, backgroundColor: "#E2E8F0", borderRadius: 3, overflow: "hidden", marginBottom: 6 },
  progressFill: { height: "100%", backgroundColor: "#16A34A", borderRadius: 3 },
  goalProgress: { fontSize: 12, color: "#16A34A", fontWeight: "600" },
  txList: { gap: 10 },
  txCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14 },
  txIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", marginRight: 12 },
  txInfo: { flex: 1, marginRight: 8 },
  txTitle: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  txMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 8 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryBadgeText: { fontSize: 11, fontWeight: "600" },
  txDate: { fontSize: 12, color: "#94A3B8" },
  txAmount: { fontSize: 14, fontWeight: "700" },
  emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 40, alignItems: "center", justifyContent: "center" },
  emptyText: { marginTop: 12, color: "#94A3B8", fontSize: 15 },
  emptySubText: { marginTop: 8, color: "#94A3B8", fontSize: 12, textAlign: "center" },
  skeletonCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16 },
  skeletonLine: { height: 12, backgroundColor: "#E2E8F0", borderRadius: 6, marginBottom: 10 },
  skeletonLineShort: { height: 12, width: "55%", backgroundColor: "#E2E8F0", borderRadius: 6, marginBottom: 10 },
  skeletonLineMedium: { height: 12, width: "80%", backgroundColor: "#F1F5F9", borderRadius: 6 },
  skeletonTxRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  skeletonCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#E2E8F0", marginRight: 12 },
  skeletonTxLines: { flex: 1 },
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
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14, color: "#0F172A" },
  filterTabs: { marginBottom: 16, paddingVertical: 8 },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterTabActive: { backgroundColor: "#0F172A", borderColor: "#0F172A" },
  filterTabText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  filterTabTextActive: { color: "#FFFFFF" },
});