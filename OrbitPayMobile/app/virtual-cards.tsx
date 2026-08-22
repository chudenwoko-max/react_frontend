import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import Toast from "react-native-toast-message";
import axiosClient from "../src/api/axiosClient";

type VirtualCard = {
  id: number;
  card_number?: string;
  last4?: string;
  expiry?: string;
  status?: string;
  balance?: string | number;
  currency?: string;
  card_type?: string;
};

export default function VirtualCardsScreen() {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  // Fund modal state
  const [fundModalVisible, setFundModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [funding, setFunding] = useState(false);

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
      await axiosClient.post("cards/create/", { card_type: "ngn" });
      Toast.show({
        type: "success",
        text1: "Card Created",
        text2: "Virtual card created successfully",
      });
      fetchCards();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.response?.data?.error || "Failed to create card",
      });
    } finally {
      setCreating(false);
    }
  };

  const openFundModal = (card: VirtualCard) => {
    setSelectedCard(card);
    setFundAmount("");
    setFundModalVisible(true);
  };

  const handleFundCard = async () => {
    if (!selectedCard || !fundAmount) {
      Alert.alert("Error", "Please enter an amount");
      return;
    }

    setFunding(true);
    try {
      await axiosClient.post(`cards/${selectedCard.id}/fund/`, {
        amount: fundAmount,
      });

      Toast.show({
        type: "success",
        text1: "Card Funded ✅",
        text2: `₦${Number(fundAmount).toLocaleString()} added successfully`,
      });

      setFundModalVisible(false);
      fetchCards(); // refresh balances
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Funding Failed",
        text2: err.response?.data?.error || "Could not fund card",
      });
    } finally {
      setFunding(false);
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
              ₦
              {Number(item.balance || 0).toLocaleString("en-NG", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View>
            <Text style={styles.label}>Expiry</Text>
            <Text style={styles.expiry}>{item.expiry || "••/••"}</Text>
          </View>
        </View>

        {/* Fund Button */}
        {!isFrozen && (
          <TouchableOpacity
            style={styles.fundButton}
            onPress={() => openFundModal(item)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus-circle" size={18} color="#fff" />
            <Text style={styles.fundButtonText}>Fund Card</Text>
          </TouchableOpacity>
        )}
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

      {/* Fund Modal */}
      <Modal
        visible={fundModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFundModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Fund Virtual Card</Text>
            <Text style={styles.modalSubtitle}>
              Card ending •••• {selectedCard?.last4 || selectedCard?.card_number?.slice(-4)}
            </Text>

            <TextInput
              style={styles.amountInput}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={fundAmount}
              onChangeText={setFundAmount}
            />

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setFundModalVisible(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleFundCard}
                loading={funding}
                style={{ flex: 1 }}
              >
                Fund
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
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
  fundButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C3AED",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  fundButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
});