import { useCallback, useEffect, useState } from "react";
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
import axiosClient from "../src/api/axiosClient";

type Notification = {
  id: number;
  title?: string;
  message?: string;
  body?: string;
  is_read?: boolean;
  read?: boolean;
  created_at?: string;
  type?: string;
  notification_type?: string;
};

export default function NotificationsScreen() {
  const [items, setItems] = useState<Notification[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async (next?: string | null, replace = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axiosClient.get("notifications/", {
        params: { limit: 20, ...(next ? { cursor: next } : {}) },
      });
      const batch: Notification[] = res.data.results || [];
      setItems((prev) => (replace || !next ? batch : [...prev, ...batch]));
      setCursor(res.data.next_cursor ?? null);
    } catch (error) {
      console.log("Notifications error:", error);
      if (replace || !next) setItems([]);
    } finally {
      setLoading(false);
      setInitial(false);
      setRefreshing(false);
    }
  }, [loading]);

  useEffect(() => {
    loadNotifications(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications(null, true);
  };

  const onEndReached = () => {
    if (!cursor || loading) return;
    loadNotifications(cursor);
  };

  const markAsRead = async (id: number) => {
    try {
      await axiosClient.post(`notifications/${id}/read/`);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read: true } : n))
      );
    } catch (error) {
      console.log("Mark read error:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosClient.post("notifications/read-all/");
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true, read: true })));
    } catch (error) {
      console.log("Mark all read error:", error);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const isRead = item.is_read || item.read;
    const kind = item.notification_type || item.type;
    const isRequest = kind === "request";

    return (
      <TouchableOpacity
        style={[styles.card, !isRead && styles.unreadCard]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.9}
      >
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name={isRequest ? "cash-plus" : "bell-outline"}
            size={20}
            color={isRead ? "#94A3B8" : "#0F172A"}
          />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, !isRead && styles.unreadText]}>
            {item.title || "Notification"}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {item.message || item.body || ""}
          </Text>
          <Text style={styles.date}>
            {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (initial && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Notifications</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAll}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loading && items.length > 0 ? (
            <ActivityIndicator style={{ marginVertical: 16 }} color="#0F172A" />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="bell-off-outline" size={40} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>
              You’ll see important updates here — money requests, transfers,
              withdrawals and more.
            </Text>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: { fontSize: 24, fontWeight: "700", color: "#0F172A" },
  markAll: { fontSize: 14, color: "#0284C7", fontWeight: "600" },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  unreadCard: { borderLeftWidth: 4, borderLeftColor: "#0F172A" },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600", color: "#64748B" },
  unreadText: { color: "#0F172A", fontWeight: "700" },
  message: { fontSize: 14, color: "#64748B", marginTop: 4 },
  date: { fontSize: 12, color: "#94A3B8", marginTop: 6 },
  empty: { alignItems: "center", marginTop: 80, paddingHorizontal: 30 },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#0F172A", marginBottom: 8 },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
});