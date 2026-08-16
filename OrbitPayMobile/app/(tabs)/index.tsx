import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
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
};

export default function Dashboard() {
  const { user, logout } = useAuth();
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
      const res = await axiosClient.get("transactions/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];

      setRecentTransactions(data.slice(0, 6));

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let spent = 0;
      let received = 0;

      const days = [0, 0, 0, 0, 0, 0, 0];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

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

        const txDay = new Date(tx.created_at);
        txDay.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - txDay.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 6 && !isCredit) {
          days[diffDays] += amount;
        }
      });

      setMonthSpent(spent);
      setMonthReceived(received);
      setWeeklyData(days.reverse());
    } catch (error) {
      console.log("Recent transactions error:", error);
      setRecentTransactions([]);
      setMonthSpent(0);
      setMonthReceived(0);
      setWeeklyData([0, 0, 0, 0, 0, 0, 0]);
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

  const renderTransaction = (item: Transaction) => {
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
          <Text style={styles.txDate}>
            {item.created_at
              ? new Date(item.created_at).toLocaleDateString()
              : "—"}
          </Text>
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
                        width: `${Math.min(
                          Number(goal.progress || 0),
                          100
                        )}%`,
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

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} color="#0F172A" />
      ) : recentTransactions.length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons name="history" size={40} color="#CBD5E1" />
          <Text style={styles.emptyText}>No transactions yet</Text>
        </View>
      ) : (
        <View style={styles.txList}>
          {recentTransactions.map(renderTransaction)}
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
  greeting: {
    fontSize: 16,
    color: "#64748B",
  },
  username: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 24,
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
  },
  txTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  txDate: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
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
});