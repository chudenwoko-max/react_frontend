// ========== FILE: src/components/dashboard/DashboardSections.tsx ==========

import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

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

export const WalletsGrid = memo(function WalletsGrid({
  wallets,
}: {
  wallets: any[];
}) {
  const wallet = wallets.find(
    (w) => w.currency_code === "NGN" || w.currency?.code === "NGN"
  );
  const balance = wallet ? Number(wallet.balance || 0) : 0;

  return (
    <>
      <Text style={styles.sectionTitle}>My Wallet</Text>
      <View style={styles.walletsGrid}>
        <TouchableOpacity
          style={[styles.walletCard, { width: "100%" }]}
          onPress={() => router.push("/(tabs)/wallet")}
          activeOpacity={0.8}
        >
          <Text style={styles.walletCode}>NGN</Text>
          <Text style={styles.walletBalance}>
            ₦
            {balance.toLocaleString("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
});

export const QuickActions = memo(function QuickActions() {
  return (
    <View style={styles.quickLinksContainer}>
      <Text style={styles.quickLinksTitle}>Quick Links</Text>
      <View style={styles.quickLinksGrid}>
        <TouchableOpacity
          style={styles.quickLinkCard}
          onPress={() => router.push("/(tabs)/kyc" as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.quickLinkIcon, { backgroundColor: "#DCFCE7" }]}>
            <Ionicons name="shield-checkmark" size={26} color="#16A34A" />
          </View>
          <Text style={styles.quickLinkLabel}>KYC</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickLinkCard}
          onPress={() => router.push("/pay" as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.quickLinkIcon, { backgroundColor: "#EDE9FE" }]}>
            <MaterialCommunityIcons name="storefront" size={26} color="#7C3AED" />
          </View>
          <Text style={styles.quickLinkLabel}>Pay Merchant</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickLinkCard}
          onPress={() => router.push("/(tabs)/guide" as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.quickLinkIcon, { backgroundColor: "#DBEAFE" }]}>
            <Ionicons name="help-circle" size={26} color="#2563EB" />
          </View>
          <Text style={styles.quickLinkLabel}>How to Use{"\n"}Payhost</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickLinkCard}
          onPress={() => router.push("/orbit-ai" as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.quickLinkIcon, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="sparkles" size={26} color="#D97706" />
          </View>
          <Text style={styles.quickLinkLabel}>Payhost AI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

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

export const PendingWithdrawBanner = memo(function PendingWithdrawBanner({
  pending,
  onCancel,
  cancelling,
}: {
  pending: {
    reference: string;
    amount: string;
    status: string;
  } | null;
  onCancel: () => void;
  cancelling?: boolean;
}) {
  if (!pending) return null;
  return (
    <View style={styles.pendingCard}>
      <Text style={styles.pendingTitle}>Withdrawal in progress</Text>
      <Text style={styles.pendingBody}>
        ₦
        {Number(pending.amount).toLocaleString("en-NG", {
          minimumFractionDigits: 2,
        })}{" "}
        is on hold ({pending.status}). Cancel if Paystack did not queue it.
      </Text>
      <TouchableOpacity
        style={styles.pendingBtn}
        onPress={onCancel}
        disabled={cancelling}
      >
        <Text style={styles.pendingBtnText}>
          {cancelling ? "Cancelling…" : "Cancel and refund"}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

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
  quickLinksContainer: {
    marginTop: 4,
    marginBottom: 16,
  },
  quickLinksTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 12,
    fontFamily: "serif",
  },
  quickLinksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  quickLinkCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  quickLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickLinkLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1E293B",
    textAlign: "center",
    lineHeight: 18,
    fontFamily: "serif",
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
  pendingCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 6,
  },
  pendingBody: {
    fontSize: 14,
    color: "#78350F",
    lineHeight: 20,
    marginBottom: 12,
  },
  pendingBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#0F172A",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  pendingBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
});