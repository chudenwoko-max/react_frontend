import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import axiosClient from "../../src/api/axiosClient";

export default function ForgotPasscode() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) return;
    setLoading(true);
    try {
      await axiosClient.post("passcode-reset/request/", { username: username.trim() });
      setSent(true);
      Alert.alert("If the account exists, a reset link has been sent");
    } catch (err: any) {
      Alert.alert(err.response?.data?.error || "Unable to send reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot passcode?</Text>
      <Text style={styles.desc}>Enter your username. We’ll send a reset link to the linked email.</Text>

      {!sent ? (
        <>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            style={styles.input}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.button}>
            <Text style={styles.buttonText}>{loading ? "Sending..." : "Send reset link"}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={{ color: "#166534", textAlign: "center" }}>Check your email for the reset link.</Text>
      )}

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Back to Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f8fafc" },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  desc: { textAlign: "center", color: "#64748B", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: { backgroundColor: "#0F172A", padding: 16, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  link: { textAlign: "center", marginTop: 20, color: "#0284C7" },
});