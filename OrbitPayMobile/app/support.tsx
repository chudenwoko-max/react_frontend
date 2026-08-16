import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Modal } from "react-native";
import { Button, TextInput, HelperText } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axiosClient from "../src/api/axiosClient";

export default function SupportScreen() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await axiosClient.get("support/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setTickets(data);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const createTicket = async () => {
    if (!subject || !message) return;
    setCreating(true);
    try {
      await axiosClient.post("support/create/", { subject, message });
      setModalVisible(false);
      setSubject("");
      setMessage("");
      fetchTickets();
    } catch (err: any) {
      console.log(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Support</Text>
        <Button mode="contained" onPress={() => setModalVisible(true)} compact>New Ticket</Button>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="headset" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No tickets yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.subject}</Text>
            <Text style={styles.status}>{item.status?.toUpperCase()}</Text>
            <Text style={styles.date}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}</Text>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Support Ticket</Text>
            <TextInput label="Subject" value={subject} onChangeText={setSubject} mode="outlined" style={styles.input} />
            <TextInput label="Message" value={message} onChangeText={setMessage} mode="outlined" multiline numberOfLines={4} style={styles.input} />
            <Button mode="contained" onPress={createTicket} loading={creating}>Submit</Button>
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
  header: { fontSize: 24, fontWeight: "700" },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: "600" },
  status: { fontSize: 13, color: "#0284C7", marginTop: 4 },
  date: { fontSize: 12, color: "#94A3B8", marginTop: 4 },
  empty: { alignItems: "center", marginTop: 80 },
  emptyText: { marginTop: 12, color: "#94A3B8" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  input: { marginBottom: 12 },
});