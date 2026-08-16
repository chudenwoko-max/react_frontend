import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import axiosClient from "../src/api/axiosClient";

export default function SearchUsersScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchUsers = async (text: string) => {
    setQuery(text);

    if (text.length < 2) {
      setUsers([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axiosClient.get(`users/search/?q=${text}`);
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setUsers(data);
      setSearched(true);
    } catch (error) {
      console.log("Search error:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const selectUser = (username: string) => {
  if (returnTo === "send") {
    router.replace({
      pathname: "/(tabs)/send",
      params: { selectedUser: username },
    });
  } else if (returnTo === "request-money" || returnTo === "request") {
    router.replace({
      pathname: "/request-money",
      params: { selectedUser: username },
    });
  } else {
    router.back();
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Search Users</Text>
      </View>

      <TextInput
        label="Search by username"
        value={query}
        onChangeText={searchUsers}
        mode="outlined"
        autoCapitalize="none"
        autoFocus
        style={styles.input}
        left={<TextInput.Icon icon="magnify" />}
      />

      {loading && (
        <ActivityIndicator style={{ marginTop: 20 }} color="#0F172A" />
      )}

      <FlatList
        data={users}
        keyExtractor={(item) => item.id?.toString() || item.username}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          searched && !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userCard}
            onPress={() => selectUser(item.username)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.username?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.username}>{item.username}</Text>
              {item.email && (
                <Text style={styles.email}>{item.email}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
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
    gap: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  input: {
    marginBottom: 16,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  email: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  empty: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 15,
  },
});