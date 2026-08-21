import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import axiosClient from "../../src/api/axiosClient";
import { router } from "expo-router";

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
        params: { page_size: 100 },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];

      setRecentTransactions(data.slice(0, 20));

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let spent = 0;
      let received = 0;

      data.forEach((tx: any) => {
        if (!tx.created_at) return;

        const amount = Number(tx.amount) || 0;
        const type = (tx.type || tx.transaction_type || "").toLowerCase();
        const desc = (tx.description || tx.note || "").toLowerCase();

        const isCredit =
          type === "credit" ||
          type === "fund" ||
          type === "receive" ||
          type === "funding" ||
          type === "referral_bonus" ||
          desc.includes("received") ||
          desc.includes("wallet funding") ||
          desc.includes("funded");

        const txDate = new Date(tx.created_at);
        if (
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear
        ) {
          if (isCredit) {
            received += amount;
          } else {
            spent += amount;
          }
        }
      });

      setMonthSpent(spent);
      setMonthReceived(received);
    } catch (error) {
      console.log("Recent transactions error:", error);
      setRecentTransactions([]);
      setMonthSpent(0);
      setMonthReceived(0);
    }
  };

  const fetchWeeklySpending = async () => {
    try {
      const res = await axiosClient.get("analytics/weekly-spending/");
      const days = res.data.weekly_spending || [];
      // Backend returns oldest → newest (7 items)
      setWeeklyData(days.map((d: any) => Number(d.amount) || 0));
    } catch (error) {
      console.log("Weekly spending error:", error);
      setWeeklyData([0, 0, 0, 0, 0, 0, 0]);
    }
  };

  const fetchLatestInsight = async () => {
    try {
      const res = await axiosClient.get("insights/latest/");
      const weekly = res.data?.weekly || null;
      setWeeklyInsight(weekly);

      // Mark as read (once)
      if (weekly?.id && weekly.is_read === false) {
        try {
          await axiosClient.post(`insights/${weekly.id}/read/`);
        } catch (e) {
          console.log("Mark insight read error:", e);
        }
      }
    } catch (error) {
      console.log("Insight error:", error);
      setWeeklyInsight(null);
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
      fetchWeeklySpending(),
      fetchLatestInsight(),
      fetchSavingsSuggestion(),
      fetchCashflowAlert(),
    ]);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.log(e);
    } finally {
      router.dismissAll();
      router.replace("/(auth)/login");
    }
  };

  const getFilteredTransactions = () => {
    let filtered = recentTransactions;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          (tx.description || "").toLowerCase().includes(query) ||
          (tx.note || "").toLowerCase().includes(query) ||
          (tx.category || "").toLowerCase().includes(query)
      );
    }

    // Apply type filter
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

        if (filterType === "sent") return !isCredit && !desc.includes("bill") && !desc.includes("withdraw") && type !== "withdraw";
        if (filterType === "received") return isCredit;
        if (filterType === "bills") return desc.includes("bill") || ["electricity", "cable", "data", "airtime"].includes(category);
        if (filterType === "others") return !isCredit && !desc.includes("bill") && !desc.includes("withdraw") && type !== "withdraw" && !["electricity", "cable", "data", "airtime"].includes(category);
        return true;
      });
    }

    return filtered;
  };

  const renderTransaction = (item: Transaction) => {
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
        onPress={() =>
          router.push(`/transaction/${item.id || item.reference_id}`)
        }
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.txIcon,
            { backgroundColor: isCredit ? "#DCFCE7" : "#FEE2E2" },
          ]}
        >
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
              {item.created_at
                ? new Date(item.created_at).toLocaleDateString()
                : "—"}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.txAmount,
            { color: isCredit ? "#16A34A" : "#DC2626" },
          ]}
        >
          {isCredit ? "+" : "-"}₦
          {Number(item.amount).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
          })}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => router.push("/notifications")}
            style={styles.iconButton}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color="#0F172A"
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.cardLabel}>Total Balance</Text>
        {loading ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 12 }} />
        ) : (
          <Text style={styles.balance}>{balance}</Text>
        )}
      </View>

      {/* Orbit Insights & Smart Save - with Skeleton Loading */}
      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        <>
          {weeklyInsight && (
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#F59E0B" />
                <Text style={styles.insightLabel}>Orbit Insight · This week</Text>
              </View>
              <Text style={styles.insightTitle}>{weeklyInsight.title}</Text>
              <Text style={styles.insightMessage}>{weeklyInsight.message}</Text>
            </View>
          )}

          {savingsSuggestion && (
            <View style={styles.suggestionCard}>
              <View style={styles.insightHeader}>
                <MaterialCommunityIcons name="piggy-bank-outline" size={20} color="#0D9488" />
                <Text style={styles.suggestionLabel}>Smart Save</Text>
              </View>

              <Text style={styles.insightTitle}>
                Save ₦{Number(savingsSuggestion.suggested_amount).toLocaleString()} weekly
              </Text>
              <Text style={styles.insightMessage}>
                {savingsSuggestion.reason}
              </Text>

              <View style={styles.suggestionActions}>
                <TouchableOpacity style={styles.acceptBtn} onPress={acceptSuggestion}>
                  <Text style={styles.acceptText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dismissBtn} onPress={dismissSuggestion}>
                  <Text style={styles.dismissText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {cashflowAlert && (
            <View
              style={[
                styles.cashflowCard,
                cashflowAlert.status === "critical"
                  ? styles.cashflowCritical
                  : styles.cashflowWarning,
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
                    {
                      color:
                        cashflowAlert.status === "critical" ? "#DC2626" : "#D97706",
                    },
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

      {/* This Month Snapshot */}
      <View style={styles.snapshotCard}>
        <Text style={styles.snapshotTitle}>This Month</Text>
        <View style={styles.snapshotRow}>
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotLabel}>Spent</Text>
            <Text style={[styles.snapshotValue, { color: "#DC2626" }]}>
              ₦{monthSpent.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotLabel}>Received</Text>
            <Text style={[styles.snapshotValue, { color: "#16A34A" }]}>
              ₦
              {monthReceived.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Multi-currency Wallets */}
      <Text style={styles.sectionTitle}>My Wallets</Text>
      <View style={styles.walletsGrid}>
        {["NGN", "USD", "EUR", "GBP"].map((code) => {
          const wallet = wallets.find(
            (w) => w.currency_code === code || w.currency?.code === code
          );
          const balance = wallet ? Number(wallet.balance || 0) : 0;
          const symbol =
            code === "NGN"
              ? "₦"
              : code === "USD"
              ? "$"
              : code === "EUR"
              ? "€"
              : "£";

          return (
            <TouchableOpacity
              key={code}
              style={styles.walletCard}
              onPress={() => router.push("/(tabs)/wallet")}
              activeOpacity={0.8}
            >
              <Text style={styles.walletCode}>{code}</Text>
              <Text style={styles.walletBalance}>
                {symbol}
                {balance.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/(tabs)/send")}
        >
          <View style={[styles.iconCircle, { backgroundColor: "#E0F2FE" }]}>
            <MaterialCommunityIcons name="send" size={24} color="#0284C7" />
          </View>
          <Text style={styles.actionText}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/(tabs)/fund")}
        >
          <View style={[styles.iconCircle, { backgroundColor: "#DCFCE7" }]}>
            <MaterialCommunityIcons name="plus" size={24} color="#16A34A" />
          </View>
          <Text style={styles.actionText}>Fund</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/withdraw")}
        >
          <View style={[styles.iconCircle, { backgroundColor: "#FEE2E2" }]}>
            <MaterialCommunityIcons
              name="bank-transfer-out"
              size={24}
              color="#DC2626"
            />
          </View>
          <Text style={styles.actionText}>Withdraw</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/(tabs)/history")}
        >
          <View style={[styles.iconCircle, { backgroundColor: "#F3E8FF" }]}>
            <MaterialCommunityIcons name="history" size={24} color="#7C3AED" />
          </View>
          <Text style={styles.actionText}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
  style={styles.actionButton}
  onPress={() => router.push("/orbit-ai")}
>
  <View style={[styles.iconCircle, { backgroundColor: "#EDE9FE" }]}>
    <MaterialCommunityIcons
      name="robot-happy-outline"
      size={24}
      color="#7C3AED"
    />
  </View>
  <Text style={styles.actionText}>Orbit AI</Text>
</TouchableOpacity>
      </View>

      {/* 7-Day Spending Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Spending • Last 7 days</Text>
        <View style={styles.chartContainer}>
          {weeklyData.map((value, index) => {
            const max = Math.max(...weeklyData, 1);
            const height = Math.max((value / max) * 80, 4);
            const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
            const todayIndex = new Date().getDay();
            const labelIndex = (todayIndex - 6 + index + 7) % 7;

            return (
              <View key={index} style={styles.barWrapper}>
                <View style={[styles.bar, { height }]} />
                <Text style={styles.barLabel}>{dayLabels[labelIndex]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Savings Goals */}
      {savingsGoals.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Savings Goals</Text>
            <TouchableOpacity onPress={() => router.push("/savings")}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 28 }}
          >
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
                      {
                        width: `${Math.min(Number(goal.progress || 0), 100)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.goalProgress}>
                  {Math.round(Number(goal.progress || 0))}%
                </Text>
              </View>
            ))}
          </ScrollView>
        </>
      )}

      {/* Recent Activity */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentTransactions.length > 0 && (
          <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
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

      {/* Filter Tabs */}
      {recentTransactions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterTabs}
        >
          {(["all", "sent", "received", "bills", "others"] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterTab,
                filterType === type && styles.filterTabActive,
              ]}
              onPress={() => setFilterType(type)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filterType === type && styles.filterTabTextActive,
                ]}
              >
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
          <Text style={styles.emptySubText}>
            Fund your wallet or send money to see activity here.
          </Text>
        </View>
      ) : getFilteredTransactions().length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons name="magnify" size={40} color="#CBD5E1" />
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubText}>
            Try adjusting your search or filters.
          </Text>
        </View>
      ) : (
        <View style={styles.txList}>
          {getFilteredTransactions().map(renderTransaction)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
    gap: 16,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  iconButton: {
    padding: 6,
    position: "relative",
  },
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
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#DC2626",
  },
  balanceCard: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 14,
    color: "#94A3B8",
  },
  balance: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 8,
  },
  insightCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C2410C",
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  insightMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: "#475569",
  },
  suggestionCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  suggestionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F766E",
  },
  cashflowCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
  },
  cashflowWarning: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  cashflowCritical: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  cashflowLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  suggestionActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  acceptBtn: {
    backgroundColor: "#0D9488",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  acceptText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  dismissBtn: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dismissText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
  snapshotCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
  },
  snapshotTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 14,
  },
  snapshotRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  snapshotItem: {
    flex: 1,
    alignItems: "center",
  },
  snapshotLabel: {
    fontSize: 13,
    color: "#94A3B8",
    marginBottom: 4,
  },
  snapshotValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: "#0284C7",
    fontWeight: "600",
  },
  walletsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 28,
    gap: 12,
  },
  walletCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    width: "48%",
  },
  walletCode: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 6,
  },
  walletBalance: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  actionButton: {
    alignItems: "center",
    width: 70,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 100,
  },
  barWrapper: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    width: 18,
    backgroundColor: "#0F172A",
    borderRadius: 6,
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 11,
    color: "#94A3B8",
  },
  goalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    width: 200,
    marginRight: 12,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  goalAmount: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#16A34A",
    borderRadius: 3,
  },
  goalProgress: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "600",
  },
  txList: {
    gap: 10,
  },
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    color: "#94A3B8",
    fontSize: 15,
  },
  emptySubText: {
    marginTop: 8,
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center",
  },
  skeletonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
    marginBottom: 10,
  },
  skeletonLineShort: {
    height: 12,
    width: "55%",
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
    marginBottom: 10,
  },
  skeletonLineMedium: {
    height: 12,
    width: "80%",
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
  },
  skeletonTxRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  skeletonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    marginRight: 12,
  },
  skeletonTxLines: {
    flex: 1,
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
  filterTabs: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterTabActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
});