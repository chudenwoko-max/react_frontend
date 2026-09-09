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
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import axiosClient from "../src/api/axiosClient";
import { useAuth } from "../src/context/AuthContext";

type Session = {
  id: number;
  user_agent?: string;
  device?: string;
  ip?: string;
  last_seen?: string;
  is_current: boolean;
};

// ⭐ NEW: unified label helper
function sessionLabel(s: { device_name?: string; user_agent?: string; device_type?: string }) {
  const ua = (s.user_agent || "").toLowerCase();

  if (ua.includes("okhttp") || s.device_type === "android") return "Android app";
  if (ua.includes("mozilla") || s.device_type === "web") return "Web browser";

  return s.device_name || s.user_agent || "Session";
}

export default function SessionsScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useAuth();

  const fetchSessions = async () => {
    try {
      const res = await axiosClient.get("sessions/");
      const rows = Array.isArray(res.data) ? res.data : res.data.results || [];
      setSessions(rows);
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

  const revokeSession = async (session: Session) => {
    const label = sessionLabel(session);

    if (session.is_current) {
      if (Platform.OS === "web") {
        if (window.confirm("Revoke this device and log out?")) logout();
      } else {
        Alert.alert("Logout", "This will log you out.", [
          { text: "Cancel", style: "cancel" },
          { text: "Logout", style: "destructive", onPress: () => logout() },
        ]);
      }
      return;
    }

    const ok =
      Platform.OS === "web"
        ? window.confirm(`Log out of "${label}"?`)
        : await new Promise<boolean>((resolve) => {
            Alert.alert("Revoke Session", `Log out of "${label}"?`, [
              { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
              { text: "Revoke", style: "destructive", onPress: () => resolve(true) },
            ]);
          });

    if (!ok) return;

    try {
      await axiosClient.post(`sessions/${session.id}/revoke/`);
      setSessions((prev) => prev.filter((s) => s.id !== session.id));

      if (Platform.OS === "web") window.alert("Session revoked");
      else Alert.alert("Success", "Session revoked successfully");
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Could not revoke session";

      if (Platform.OS === "web") window.alert(String(msg));
      else Alert.alert("Error", String(msg));
    }
  };

  const renderItem = ({ item }: { item: Session }) => {
    const label = sessionLabel(item);
    const subtitle = item.is_current ? "This device" : item.last_seen || "";

    return (
      <View style={[styles.card, item.is_current && styles.currentCard]}>
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name={
                label.toLowerCase().includes("android")
                  ? "android"
                  : label.toLowerCase().includes("iphone") ||
                    label.toLowerCase().includes("ios")
                  ? "apple"
                  : "monitor"
              }
              size={22}
              color="#0F172A"
            />
          </View>

          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.deviceName}>{label}</Text>

              {item.is_current && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>This device</Text>
                </View>
              )}
            </View>

            <Text style={styles.meta}>{subtitle}</Text>
          </View>

          {!item.is_current && (
            <TouchableOpacity
              style={styles.revokeBtn}
              onPress={() => revokeSession(item)}
            >
              <Text style={styles.revokeText}>Revoke</Text>
            </TouchableOpacity>
          )}
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
  currentCard: {
    borderWidth: 1.5,
    borderColor: "#0F172A",
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
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  currentBadge: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
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
