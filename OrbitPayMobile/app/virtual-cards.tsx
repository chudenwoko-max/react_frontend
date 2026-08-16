import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import axiosClient from "../src/api/axiosClient";

type VirtualCard = {
  id: number;
  card_number?: string;
  last4?: string;
  expiry?: string;
  status?: string;
  balance?: string | number;
  currency?: string;
};

export default function VirtualCardsScreen() {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchCards = async () => {
    try {
      const res = await axiosClient.get("cards/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setCards(data);
    } catch (error) {
      console.log("Cards error:", error);
      setCards([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCards();
  };

  const handleCreateCard = async () => {
    setCreating(true);
    try {
      await axiosClient.post("cards/create/");
      Alert.alert("Success", "Virtual card created successfully!");
      fetchCards();
    } catch (err: any) {
      console.log("Create card error:", err.response?.data);
      Alert.alert(
        "Error",
        err.response?.data?.error || "Failed to create virtual card"
      );
    } finally {
      setCreating(false);
    }
  };

  const renderItem = ({ item }: { item: VirtualCard }) => {
    const last4 = item.last4 || item.card_number?.slice(-4) || "••••";
    const isFrozen = item.status === "frozen" || item.status === "inactive";

    return (
      <View style={[styles.card, isFrozen && styles.frozenCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardBrand}>OrbitPay Card</Text>
          <Text style={styles.cardStatus}>
            {item.status?.toUpperCase() || "ACTIVE"}
          </Text>
        </View>

        <Text style={styles.cardNumber}>•••• •••• •••• {last4}</Text>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.label}>Balance</Text>
            <Text style={styles.balance}>
              ₦{Number(item.balance || 0).toLocaleString("en-NG", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View>
            <Text style={styles.label}>Expiry</Text>
            <Text style={styles.expiry}>{item.expiry || "••/••"}</Text>
          </View>
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
      <Text style={styles.header}>Virtual Cards</Text>

      <Button
        mode="contained"
        onPress={handleCreateCard}
        loading={creating}
        style={styles.createButton}
        icon="plus"
      >
        Create New Card
      </Button>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="credit-card-outline"
              size={48}
              color="#CBD5E1"
            />
            <Text style={styles.emptyText}>No virtual cards yet</Text>
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 20,
  },
  createButton: {
    marginBottom: 20,
    borderRadius: 10,
  },
  card: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  frozenCard: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  cardBrand: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
  },
  cardStatus: {
    color: "#4ADE80",
    fontSize: 12,
    fontWeight: "700",
  },
  cardNumber: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: 24,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    color: "#94A3B8",
    fontSize: 12,
  },
  balance: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  expiry: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
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