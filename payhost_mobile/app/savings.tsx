import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity, Alert, Modal, TextInput as RNTextInput
} from "react-native";
import { Button, TextInput, HelperText } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axiosClient from "../src/api/axiosClient";

export default function SavingsScreen() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await axiosClient.get("savings/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setGoals(data);
    } catch (err) {
      console.log(err);
      setGoals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const createGoal = async () => {
    if (!title || !target) {
      setError("Title and target amount are required");
      return;
    }
    setCreating(true);
    setError("");
    try {
      await axiosClient.post("savings/create/", {
        title,
        target_amount: target,
      });
      setModalVisible(false);
      setTitle("");
      setTarget("");
      fetchGoals();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create goal");
    } finally {
      setCreating(false);
    }
  };

  const addMoney = async (goalId: number) => {
    Alert.prompt("Add Money", "Enter amount to add", async (amount) => {
      if (!amount) return;
      try {
        await axiosClient.post(`savings/${goalId}/add/`, { amount });
        fetchGoals();
      } catch (err: any) {
        Alert.alert("Error", err.response?.data?.error || "Failed");
      }
    });
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
      <View style={styles.headerRow}>
        <Text style={styles.header}>Savings Goals</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <MaterialCommunityIcons name="plus-circle" size={28} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchGoals(); }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="piggy-bank-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No savings goals yet</Text>
          </View>
        }
        renderItem={({ item }) => {
          const progress = Math.min((Number(item.current_amount || 0) / Number(item.target_amount || 1)) * 100, 100);
          return (
            <View style={styles.card}>
              <Text style={styles.goalTitle}>{item.title}</Text>
              <Text style={styles.amount}>
                ₦{Number(item.current_amount || 0).toLocaleString()} / ₦{Number(item.target_amount).toLocaleString()}
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Button mode="outlined" onPress={() => addMoney(item.id)} style={{ marginTop: 12 }}>
                Add Money
              </Button>
            </View>
          );
        }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Savings Goal</Text>
            <TextInput label="Goal Title" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
            <TextInput label="Target Amount" value={target} onChangeText={setTarget} mode="outlined" keyboardType="numeric" style={styles.input} />
            {error ? <HelperText type="error">{error}</HelperText> : null}
            <Button mode="contained" onPress={createGoal} loading={creating} style={styles.button}>
              Create Goal
            </Button>
            <Button onPress={() => setModalVisible(false)}>Cancel</Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", paddingTop: 60, paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  header: { fontSize: 24, fontWeight: "700", color: "#0F172A" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, marginBottom: 14 },
  goalTitle: { fontSize: 17, fontWeight: "600", color: "#0F172A" },
  amount: { fontSize: 14, color: "#64748B", marginTop: 4 },
  progressBar: { height: 8, backgroundColor: "#E2E8F0", borderRadius: 4, marginTop: 12 },
  progressFill: { height: 8, backgroundColor: "#16A34A", borderRadius: 4 },
  empty: { alignItems: "center", marginTop: 80 },
  emptyText: { marginTop: 12, color: "#94A3B8" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  input: { marginBottom: 12 },
  button: { marginTop: 8, borderRadius: 10 },
});