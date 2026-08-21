import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import axiosClient from "../src/api/axiosClient";

type Session = {
  id: number;
  device_name: string;
  device_type: string;
  ip_address: string;
  location: string;
  last_activity: string;
  created_at: string;
  is_current: boolean;
};

export default function SessionsScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = async () => {
    try {
      const res = await axiosClient.get("sessions/");
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log("Sessions error:", error);
      setSessions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  const revokeSession = (sessionId: number, deviceName: string) => {
    Alert.alert(
      "Revoke Session",
      `Are you sure you want to log out of "${deviceName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: async () => {
            try {
              await axiosClient.post(`sessions/${sessionId}/revoke/`);
              setSessions((prev) => prev.filter((s) => s.id !== sessionId));
              Alert.alert("Success", "Session revoked successfully");
            } catch (error) {
              Alert.alert("Error", "Could not revoke session");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Session }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name={
              item.device_type === "android"
                ? "android"
                : item.device_type === "ios"
                ? "apple"
                : "monitor"
            }
            size={22}
            color="#0F172A"
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.deviceName}>{item.device_name}</Text>
          <Text style={styles.meta}>
            {item.ip_address} • {item.location}
          </Text>
          <Text style={styles.meta}>Last active: {item.last_activity}</Text>
        </View>

        <TouchableOpacity
          style={styles.revokeBtn}
          onPress={() => revokeSession(item.id, item.device_name)}
        >
          <Text style={styles.revokeText}>Revoke</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Active Sessions</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="devices" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>No active sessions</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  meta: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  revokeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
  },
  revokeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#DC2626",
  },
  empty: {
    alignItems: "center",
    marginTop: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: "#94A3B8",
  },
});