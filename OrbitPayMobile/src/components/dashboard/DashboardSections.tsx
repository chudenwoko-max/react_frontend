// ========== NEW FILE: src/components/dashboard/DashboardSections.tsx ==========

import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

// ---------- Balance Card ----------
export const BalanceCard = memo(function BalanceCard({
  balance,
  loading,
}: {
  balance: string;
  loading: boolean;
}) {
  return (
    <View style={styles.balanceCard}>
      <Text style={styles.cardLabel}>Total Balance</Text>
      {loading ? (
        <Text style={[styles.balance, { opacity: 0.5 }]}>Loading...</Text>
      ) : (
        <Text style={styles.balance}>{balance}</Text>
      )}
    </View>
  );
});

// ---------- Month Snapshot ----------
export const MonthSnapshot = memo(function MonthSnapshot({
  monthSpent,
  monthReceived,
}: {
  monthSpent: number;
  monthReceived: number;
}) {
  return (
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
  );
});

// ---------- Wallets Grid ----------
export const WalletsGrid = memo(function WalletsGrid({
  wallets,
}: {
  wallets: any[];
}) {
  return (
    <>
      <Text style={styles.sectionTitle}>My Wallets</Text>
      <View style={styles.walletsGrid}>
        {["NGN", "USD", "EUR", "GBP"].map((code) => {
          const wallet = wallets.find(
            (w) => w.currency_code === code || w.currency?.code === code
          );
          const balance = wallet ? Number(wallet.balance || 0) : 0;
          const symbol =
            code === "NGN" ? "₦" : code === "USD" ? "$" : code === "EUR" ? "€" : "£";

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
    </>
  );
});

// ---------- Quick Actions ----------
export const QuickActions = memo(function QuickActions() {
  return (
    <>
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
    </>
  );
});

// ---------- Weekly Chart ----------
export const WeeklyChart = memo(function WeeklyChart({
  weeklyData,
}: {
  weeklyData: number[];
}) {
  const max = Math.max(...weeklyData, 1);
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const todayIndex = new Date().getDay();

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Spending • Last 7 days</Text>
      <View style={styles.chartContainer}>
        {weeklyData.map((value, index) => {
          const height = Math.max((value / max) * 80, 4);
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
  );
});

// ---------- Styles (shared by these components) ----------
const styles = StyleSheet.create({
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
});