import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import axiosClient from "../src/api/axiosClient";

export default function RequestMoneyScreen() {
  const { selectedUser } = useLocalSearchParams<{ selectedUser?: string }>();
  const [fromUser, setFromUser] = useState(selectedUser || "");
    const [favorites, setFavorites] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

    useEffect(() => {
    axiosClient
      .get("favorites/")
      .then((res) => {
        const rows = Array.isArray(res.data)
          ? res.data
          : res.data.results || res.data.favorites || [];
        setFavorites(rows);
      })
      .catch(() => setFavorites([]));
  }, []);

  const favHandle = (f: any) =>
    f.recipient_username || f.username || f.recipient?.username || "";

  const favLabel = (f: any) =>
    f.nickname || favHandle(f) || "User";

  const handleRequest = async () => {
    if (!fromUser || !amount) {
      setError("Please fill in the user and amount");
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axiosClient.post("request-money/", {
        recipient: fromUser, // or "from_user" / "username" depending on backend
        amount: amount,
        note: note || "",
      });

            const message = res.data.message || "Money request sent successfully!";
      if (Platform.OS === "web") {
        window.alert(message);
      } else {
        Alert.alert("Request sent", message);
      }

      setFromUser("");
      setAmount("");
      setNote("");
      router.replace("/(tabs)");
    } catch (err: any) {
      console.log("Request error:", err.response?.data);
      const message =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to send request. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={styles.container}
  >
    <ScrollView
      contentContainerStyle={styles.inner}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Request Money</Text>
      <Text style={styles.subtitle}>Ask another OrbitPay user for money</Text>

      {favorites.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: "#64748B", marginBottom: 8, fontWeight: "600" }}>
            Favorites
          </Text>
          {favorites.map((f) => (
            <TouchableOpacity
              key={f.id || favHandle(f)}
              onPress={() => setFromUser(favHandle(f))}
              style={{
                backgroundColor: "#E2E8F0",
                borderRadius: 10,
                padding: 12,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontWeight: "700", color: "#0F172A" }}>
                {favLabel(f)}
              </Text>
              <Text style={{ color: "#64748B" }}>@{favHandle(f)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Searchable User Field */}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/search-users",
            params: { returnTo: "request-money" },
          })
        }
        activeOpacity={0.7}
      >
        <View pointerEvents="none">
          <TextInput
            label="Request From (Username)"
            value={fromUser}
            mode="outlined"
            style={styles.input}
            right={<TextInput.Icon icon="magnify" />}
          />
        </View>
      </TouchableOpacity>

      <TextInput
        label="Amount (NGN)"
        value={amount}
        onChangeText={setAmount}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        label="Note (optional)"
        value={note}
        onChangeText={setNote}
        mode="outlined"
        style={styles.input}
      />

      {error ? (
        <HelperText type="error" visible={true}>
          {error}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={handleRequest}
        loading={loading}
        style={styles.button}
        contentStyle={{ paddingVertical: 6 }}
      >
        Request Money
      </Button>
    </ScrollView>
  </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  inner: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 28,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 12,
    borderRadius: 10,
  },
});