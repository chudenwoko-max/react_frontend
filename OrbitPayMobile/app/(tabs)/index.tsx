import { useFocusEffect } from "expo-router";
import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  DeviceEventEmitter,
  Platform,
  Image,
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
  PendingWithdrawBanner,
} from "../../src/components/dashboard/DashboardSections";
import { unregisterPushToken } from "../../src/notifications/push";
import { FINANCIALS_REFRESH } from "../../src/notifications/refreshOnPush";
import {
  fetchSnapshot as fetchFinancialSnapshot,
  fetchRecentTransactions as fetchFinancialRecent,
  mapLedgerToHistory,
} from "../../src/api/financials";

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

// CHANGE: website greeting is Georgia-style serif.
const SERIF = Platform.OS === "web" ? "Georgia, 'Times New Roman', serif" : "serif";

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatNgn(amount: number) {
  return Number(amount).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  });
}

function consumerBalanceFromSnapshot(snap: any): number {
  if (!snap || typeof snap !== "object") return 0;
  const raw =
    snap.consumer_available ??
    snap.available ??
    snap.consumer_balance ??
    snap.balance ??
    0;
  return Number(raw) || 0;
}

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

const SkeletonTx = () => (
  <View style={styles.skeletonTxRow}>
    <View style={styles.skeletonCircle} />
    <View style={styles.skeletonTxLines}>
      <View style={styles.skeletonLineShort} />
      <View style={styles.skeletonLineMedium} />
    </View>
  </View>
);

const SPEND_TYPES = new Set([
  "transfer",
  "transfer_sent",
  "merchant_pay",
  "withdraw",
  "airtime",
  "data",
  "electricity",
  "cable",
  "bills",
  "debit",
  "bill_airtime",
  "bill_data",
  "bill_electricity",
  "bill_cable",
]);

export default function Dashboard() {
  const { logout } = useAuth();
  const [balance, setBalance] = useState<string>("₦ 0.00");
  const [snapshot, setSnapshot] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingWithdraw, setPendingWithdraw] = useState<any>(null);
  const [cancellingWithdraw, setCancellingWithdraw] = useState(false);
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
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [kycLimits, setKycLimits] = useState<any>(null);
  const [username, setUsername] = useState("");

  const refreshFinancials = useCallback(async () => {
    try {
      const [snap, tx] = await Promise.all([
        fetchFinancialSnapshot(),
        fetchFinancialRecent(),
      ]);
      setSnapshot(snap);
      const rows = Array.isArray(tx) ? tx : [];
      setRecent(rows.map(mapLedgerToHistory));
      setBalance(formatNgn(consumerBalanceFromSnapshot(snap)));
    } catch (e) {
      console.log("refreshFinancials error:", e);
    }
  }, []);

  const fetchLatestInsight = async () => {
    try {
      const res = await axiosClient.get("insights/latest/");
      const weekly = res.data?.weekly || res.data?.savings || res.data;
      if (
        !weekly ||
        (!weekly.body &&
          !weekly.message &&
          !weekly.save_reason &&
          weekly.suggested_save == null &&
          !weekly.title)
      ) {
        setWeeklyInsight(null);
        return;
      }
      setWeeklyInsight({
        title: weekly.title || "Payhost Insight · This week",
        message: weekly.body || weekly.message || "",
        save_reason: weekly.save_reason || "",
        suggested_save: weekly.suggested_save,
      });
    } catch (error) {
      console.log("Insight error:", error);
      setWeeklyInsight(null);
    }
  };

  const fetchSavingsSuggestion = async () => {
    try {
      const res = await axiosClient.get("savings/suggestions/");
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.results || res.data?.suggestions || [];
      setSavingsSuggestion(Array.isArray(list) && list.length > 0 ? list[0] : null);
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

  const fetchUnreadCount = async () => {
    try {
      const res = await axiosClient.get("notifications/");
      setUnreadCount(res.data.unread_count ?? 0);
    } catch {
      setUnreadCount(0);
    }
  };

  const fetchSavingsGoals = async () => {
    try {
      const res = await axiosClient.get("savings/");
      const data = Array.isArray(res.data) ? res.data : [];
      setSavingsGoals(data.slice(0, 3));
    } catch {
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
        params: { page: 1, page_size: 8, _t: Date.now() },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setRecentTransactions(data);
    } catch (error) {
      console.log("Recent transactions error:", error);
      setRecentTransactions([]);
    }
  };

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

  const fetchSnapshot = async () => {
    try {
      const res = await axiosClient.get("wallet/snapshot/", {
        params: { range: "30d" },
      });
      const data = res.data || {};
      const daily = Array.isArray(data.daily) ? data.daily : [];
      const spends = daily
        .slice()
        .sort((a: any, b: any) => String(a.date || "").localeCompare(String(b.date || "")))
        .slice(-7)
        .map((d: { spend?: number }) => Number(d.spend) || 0);
      while (spends.length < 7) spends.unshift(0);
      setWeeklyData(spends);
      setPendingWithdraw(data.pending_withdraw || null);
      setMonthSpent(Number(data.spend) || 0);
      setMonthReceived(Number(data.received) || 0);
      setBalance(formatNgn(consumerBalanceFromSnapshot(data)));
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
      refreshFinancials(),
      fetchUnreadCount(),
      fetchRecentTransactions(),
      fetchSavingsGoals(),
      fetchWallets(),
      fetchLatestInsight(),
      fetchSavingsSuggestion(),
      fetchCashflowAlert(),
      fetchSnapshot(),
    ]);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(FINANCIALS_REFRESH, () => {
      fetchUnreadCount();
      fetchWallets();
      fetchWeeklySpend();
      fetchSnapshot();
      fetchLatestInsight();
      fetchSavingsSuggestion();
      fetchRecentTransactions();
      refreshFinancials();
    });
    return () => sub.remove();
  }, [refreshFinancials]);

  useEffect(() => {
    axiosClient
      .get("kyc/")
      .then((res) => {
        const status = res.data?.status || res.data?.kyc_status;
        setKycStatus(typeof status === "string" ? status.toLowerCase() : null);
        setKycLimits(res.data.limits || null);
      })
      .catch(() => setKycStatus(null));

    axiosClient
      .get("profile/")
      .then((res) => {
        const name =
          res.data?.username ||
          res.data?.user?.username ||
          res.data?.full_name ||
          "";
        setUsername(name);
      })
      .catch(() => setUsername(""));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshFinancials();
      fetchLatestInsight();
      fetchSavingsSuggestion();
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        loadData();
        fetchWeeklySpend();
      } else {
        Promise.all([
          fetchUnreadCount(),
          fetchWallets(),
          fetchWeeklySpend(),
          fetchSnapshot(),
          fetchRecentTransactions(),
        ]);
      }
    }, [refreshFinancials])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await fetchWeeklySpend();
    setRefreshing(false);
  };

  const cancelPendingWithdraw = async () => {
    if (!pendingWithdraw?.reference) return;
    setCancellingWithdraw(true);
    try {
      await axiosClient.post("wallet/withdraw/cancel/", {
        reference_id: pendingWithdraw.reference,
      });
      setPendingWithdraw(null);
      DeviceEventEmitter.emit(FINANCIALS_REFRESH);
      await Promise.all([
        refreshFinancials(),
        fetchSnapshot(),
        fetchRecentTransactions(),
      ]);
    } catch (e: any) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      if (status === 401) {
        await logout();
        router.replace("/(auth)/login");
        return;
      }
      if (status === 409) {
        Alert.alert(
          "Already queued",
          data?.error || "Transfer already queued at Paystack. Wait for webhook."
        );
      } else {
        Alert.alert("Cancel failed", data?.error || "Could not cancel this withdrawal.");
      }
    } finally {
      setCancellingWithdraw(false);
    }
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
          return desc.includes("bill") || ["electricity", "cable", "data", "airtime"].includes(category);
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

  void snapshot;
  void recent;
  void kycLimits;

  const kycCopy =
    kycStatus === "approved"
      ? "Identity verified"
      : kycStatus === "pending"
        ? "Verification pending. Send and pay stay off until review finishes."
        : kycStatus === "rejected"
          ? "Verification rejected. Update your BVN or government ID."
          : "A BVN or government ID is required before send and pay unlock.";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <Image
            source={require("../../assets/payhost-logo.png")}
            style={styles.wordmark}
            accessibilityLabel="Payhost"
          />
          <Text style={styles.greetLine} numberOfLines={1}>
            {greetingForNow()}, {username || "there"}!
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/notifications")}>
            <MaterialCommunityIcons name="bell-outline" size={22} color="#0F172A" />
            {unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : String(unreadCount)}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CHANGE: short identity notice. Funding and history stay open. */}
      <TouchableOpacity
        disabled={kycStatus === "approved"}
        onPress={() => router.push("/kyc")}
        style={[
          styles.kycBanner,
          kycStatus === "approved"
            ? styles.kycApproved
            : kycStatus === "rejected"
              ? styles.kycRejected
              : styles.kycPending,
        ]}
      >
        <Text
          style={[
            styles.kycText,
            {
              color:
                kycStatus === "approved"
                  ? "#166534"
                  : kycStatus === "rejected"
                    ? "#991B1B"
                    : "#92400E",
            },
          ]}
        >
          {kycCopy}
        </Text>
      </TouchableOpacity>

      <BalanceCard balance={balance} loading={loading} />
      <PendingWithdrawBanner
        pending={pendingWithdraw}
        onCancel={cancelPendingWithdraw}
        cancelling={cancellingWithdraw}
      />

      {cashflowAlert ? (
        <View
          style={[
            styles.cashflowCard,
            cashflowAlert.level === "critical" ? styles.cashflowCritical : styles.cashflowWarning,
          ]}
        >
          <Text style={styles.cashflowLabel}>{cashflowAlert.title || "Cashflow"}</Text>
          <Text style={styles.insightMessage}>{cashflowAlert.message || cashflowAlert.body || ""}</Text>
        </View>
      ) : null}

      {weeklyInsight &&
      (weeklyInsight.message || weeklyInsight.save_reason || weeklyInsight.suggested_save != null) ? (
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <MaterialCommunityIcons name="lightbulb-outline" size={18} color="#C2410C" />
            <Text style={styles.insightLabel}>Insight</Text>
          </View>
          <Text style={styles.insightTitle}>{weeklyInsight.title}</Text>
          {weeklyInsight.message ? <Text style={styles.insightMessage}>{weeklyInsight.message}</Text> : null}
          {weeklyInsight.save_reason ? (
            <Text style={[styles.insightMessage, { marginTop: 8 }]}>{weeklyInsight.save_reason}</Text>
          ) : null}
          {weeklyInsight.suggested_save != null ? (
            <Text style={[styles.insightMessage, { marginTop: 8 }]}>
              Suggested save {formatNgn(Number(weeklyInsight.suggested_save))}
            </Text>
          ) : null}
        </View>
      ) : null}

      {savingsSuggestion ? (
        <View style={styles.suggestionCard}>
          <Text style={styles.suggestionLabel}>Savings suggestion</Text>
          <Text style={styles.insightMessage}>
            {savingsSuggestion.message || savingsSuggestion.title || savingsSuggestion.body || ""}
          </Text>
          <View style={styles.suggestionActions}>
            <TouchableOpacity style={styles.dismissBtn} onPress={dismissSuggestion}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={acceptSuggestion}>
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <MonthSnapshot monthSpent={monthSpent} monthReceived={monthReceived} />
      <WalletsGrid wallets={wallets} />
      <QuickActions />
      <WeeklyChart weeklyData={weeklyData} />

      {savingsGoals.length > 0 ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Savings</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/wallet")}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {savingsGoals.map((g) => {
              const target = Number(g.target || g.target_amount || 0) || 1;
              const current = Number(g.balance || g.current || g.amount || 0);
              const pct = Math.min(100, (current / target) * 100);
              return (
                <View key={g.id || g.title} style={styles.goalCard}>
                  <Text style={styles.goalTitle} numberOfLines={1}>
                    {g.title || g.name || "Goal"}
                  </Text>
                  <Text style={styles.goalAmount}>
                    {formatNgn(current)} / {formatNgn(target)}
                  </Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.goalProgress}>{Math.round(pct)}%</Text>
                </View>
              );
            })}
          </ScrollView>
        </>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions"
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
        {(["all", "sent", "received", "bills", "others"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filterType === f && styles.filterTabActive]}
            onPress={() => setFilterType(f)}
          >
            <Text style={[styles.filterTabText, filterType === f && styles.filterTabTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <>
          <SkeletonTx />
          <SkeletonTx />
          <SkeletonTx />
        </>
      ) : filteredTransactions.length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons name="swap-horizontal" size={28} color="#94A3B8" />
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubText}>Fund, send, or pay a merchant to see activity here.</Text>
        </View>
      ) : (
        <View style={styles.txList}>{filteredTransactions.map(renderTransaction)}</View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 20, paddingTop: 16 },
  wordmark: { height: 72, width: 264, resizeMode: "contain" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  brandRow: { flexDirection: "row", alignItems: "center", flex: 1, gap: 16 },
  greetLine: { flex: 1, color: "#0F172A", fontSize: 22, fontFamily: SERIF },
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
  badgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700", fontFamily: SERIF },
  logoutText: { fontSize: 15, fontWeight: "600", color: "#DC2626", fontFamily: SERIF },
  kycBanner: { borderRadius: 12, padding: 14, marginBottom: 16 },
  kycPending: { backgroundColor: "#FEF3C7" },
  kycApproved: { backgroundColor: "#DCFCE7" },
  kycRejected: { backgroundColor: "#FEE2E2" },
  kycText: { fontFamily: SERIF, fontWeight: "700" },
  insightCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  insightHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
  insightLabel: { fontSize: 14, fontWeight: "600", color: "#C2410C", fontFamily: SERIF },
  insightTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 6, fontFamily: SERIF },
  insightMessage: { fontSize: 14, lineHeight: 20, color: "#475569", fontFamily: SERIF },
  suggestionCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  suggestionLabel: { fontSize: 14, fontWeight: "600", color: "#0F766E", fontFamily: SERIF },
  cashflowCard: { borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1 },
  cashflowWarning: { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" },
  cashflowCritical: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  cashflowLabel: { fontSize: 14, fontWeight: "600", fontFamily: SERIF },
  suggestionActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 16 },
  acceptBtn: { backgroundColor: "#0D9488", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16 },
  acceptText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", fontFamily: SERIF },
  dismissBtn: { backgroundColor: "#F1F5F9", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16 },
  dismissText: { color: "#475569", fontSize: 13, fontWeight: "600", fontFamily: SERIF },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#0F172A", marginBottom: 16, fontFamily: SERIF },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 8 },
  seeAll: { fontSize: 14, color: "#0284C7", fontWeight: "600", fontFamily: SERIF },
  goalCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, width: 200, marginRight: 12 },
  goalTitle: { fontSize: 15, fontWeight: "600", color: "#0F172A", marginBottom: 8, fontFamily: SERIF },
  goalAmount: { fontSize: 13, color: "#64748B", marginBottom: 10, fontFamily: SERIF },
  progressBar: { height: 6, backgroundColor: "#E2E8F0", borderRadius: 3, overflow: "hidden", marginBottom: 6 },
  progressFill: { height: "100%", backgroundColor: "#16A34A", borderRadius: 3 },
  goalProgress: { fontSize: 12, color: "#16A34A", fontWeight: "600", fontFamily: SERIF },
  txList: { gap: 10 },
  txCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14 },
  txIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", marginRight: 12 },
  txInfo: { flex: 1, marginRight: 8 },
  txTitle: { fontSize: 14, fontWeight: "600", color: "#0F172A", fontFamily: SERIF },
  txMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 8 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryBadgeText: { fontSize: 11, fontWeight: "600", fontFamily: SERIF },
  txDate: { fontSize: 12, color: "#94A3B8", fontFamily: SERIF },
  txAmount: { fontSize: 14, fontWeight: "700", fontFamily: SERIF },
  emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 40, alignItems: "center", justifyContent: "center" },
  emptyText: { marginTop: 12, color: "#94A3B8", fontSize: 15, fontFamily: SERIF },
  emptySubText: { marginTop: 8, color: "#94A3B8", fontSize: 12, textAlign: "center", fontFamily: SERIF },
  skeletonTxRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, marginBottom: 10 },
  skeletonCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#E2E8F0", marginRight: 12 },
  skeletonTxLines: { flex: 1 },
  skeletonLineShort: { height: 12, width: "55%", backgroundColor: "#E2E8F0", borderRadius: 6, marginBottom: 10 },
  skeletonLineMedium: { height: 12, width: "80%", backgroundColor: "#F1F5F9", borderRadius: 6 },
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
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14, color: "#0F172A", fontFamily: SERIF },
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
  filterTabText: { fontSize: 13, fontWeight: "600", color: "#64748B", fontFamily: SERIF },
  filterTabTextActive: { color: "#FFFFFF" },
});