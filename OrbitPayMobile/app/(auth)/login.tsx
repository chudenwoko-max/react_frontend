import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import axiosClient from "../../src/api/axiosClient"; // adjust path

export default function Login() {
  const [username, setUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // pre-fill username
    const saved = /* AsyncStorage.getItem("payhost_username") */ "";
    if (saved) setUsername(saved);
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || passcode.length !== 6) {
      Alert.alert("Enter username and 6-digit passcode");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosClient.post("login/", {
        username: username.trim(),
        passcode,
      });
      // await AsyncStorage.setItem("payhost_username", username.trim());
      Alert.alert("Welcome back");
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>

      <Text style={styles.label}>Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        editable={!/* saved username exists */ false}
        style={styles.input}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Passcode</Text>
      <TextInput
        value={passcode}
        onChangeText={(t) => setPasscode(t.replace(/\D/g, ""))}
        keyboardType="number-pad"
        maxLength={6}
        secureTextEntry
        style={styles.input}
        placeholder="••••••"
      />

      <TouchableOpacity onPress={handleLogin} disabled={loading} style={styles.button}>
        <Text style={styles.buttonText}>{loading ? "Signing in..." : "Sign in"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/forgot-passcode")}>
        <Text style={styles.link}>Forgot passcode?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text style={styles.link}>Don't have an account? Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f8fafc" },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 32 },
  label: { fontSize: 14, marginBottom: 6, color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#0F172A",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { textAlign: "center", marginTop: 16, color: "#0284C7" },
});