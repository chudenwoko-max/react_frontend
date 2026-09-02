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
import axiosClient from "../../src/api/axiosClient";
import { router } from "expo-router";

type Wallet = {
  id: number;
  currency_code?: string;
  currency_name?: string;
  symbol?: string;
  live?: boolean;
  currency?: {
    code: string;
    name?: string;
    symbol?: string;
  } | string;
  balance: string | number;
  is_default?: boolean;
};

export default function WalletScreen() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWallets = async () => {
    try {
      const res = await axiosClient.get("wallets/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setWallets(data);
    } catch (error) {
      console.log("Wallets error:", error);
      setWallets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWallets();
  };

  const getCurrencyCode = (wallet: Wallet) => {
    if (wallet.currency_code) return wallet.currency_code;
    if (typeof wallet.currency === "string") return wallet.currency;
    return wallet.currency?.code || "NGN";
  };

  const getCurrencySymbol = (wallet: Wallet, code: string) => {
    if (wallet.symbol) return wallet.symbol;
    if (typeof wallet.currency === "object" && wallet.currency?.symbol) {
      return wallet.currency.symbol;
    }
    switch (code) {
      case "NGN":
        return "₦";
      case "USD":
        return "$";
      case "GBP":
        return "£";
      case "EUR":
        return "€";
      default:
        return code;
    }
  };

  const renderItem = ({ item }: { item: Wallet }) => {
    const code = getCurrencyCode(item);
    const symbol = getCurrencySymbol(item, code);
    const live = item.live !== false && code === "NGN";

    return (
      <View style={[styles.card, !live && styles.cardSoon]}>
        <View style={styles.row}>
          <View style={styles.left}>
            <View style={styles.currencyCircle}>
              <Text style={styles.currencyCode}>{code}</Text>
            </View>
            <View>
              <Text style={styles.currencyName}>{code} Wallet</Text>
              {live ? (
                item.is_default ? (
                  <Text style={styles.defaultBadge}>Default</Text>
                ) : null
              ) : (
                <Text style={styles.soonBadge}>Soon — not live</Text>
              )}
            </View>
          </View>

          <Text style={styles.balance}>
            {symbol}
            {Number(item.balance).toLocaleString("en-NG", {
              minimumFractionDigits: 2,
            })}
          </Text>
        </View>
      </View>
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
      <Text style={styles.header}>My Wallets</Text>

      <FlatList
        data={wallets}
        keyExtractor={(item) =>
          item.id?.toString() || getCurrencyCode(item)
        }
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="wallet-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No wallets found</Text>
          </View>
        }
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.fundButton}
            onPress={() => router.push("/(tabs)/fund")}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.fundButtonText}>Fund Wallet</Text>
          </TouchableOpacity>
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
  fundButton: {
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  fundButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardSoon: {
    opacity: 0.55,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  currencyCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  currencyCode: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  currencyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  defaultBadge: {
    fontSize: 12,
    color: "#16A34A",
    marginTop: 2,
  },
  soonBadge: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  balance: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  empty: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: "#94A3B8",
  },
});