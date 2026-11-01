import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import axiosClient from "../../src/api/axiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USERNAME_KEY = "payhost_last_username";

export default function Login() {
  const { completeLogin } = useAuth();
  const [username, setUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameLocked, setUsernameLocked] = useState(false);

  useEffect(() => {
    const loadSavedUsername = async () => {
      try {
        const saved = await AsyncStorage.getItem(USERNAME_KEY);
        if (saved) {
          setUsername(saved);
          setUsernameLocked(true);
        }
      } catch (e) {}
    };
    loadSavedUsername();
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

      const { access, refresh } = res.data;
      if (!access || !refresh) {
        throw new Error("Login did not return tokens");
      }

      await AsyncStorage.setItem(USERNAME_KEY, username.trim());
      setUsernameLocked(true);

      await completeLogin(access, refresh);
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert(err.response?.data?.error || err.message || "Invalid credentials");
    } finally {
      setLoading(false);
      setPasscode("");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/payhost-mark.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Sign in</Text>

      <Text style={styles.label}>Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        style={[styles.input, usernameLocked && styles.inputLocked]}
        autoCapitalize="none"
        editable={!usernameLocked}
        selectTextOnFocus={!usernameLocked}
      />

      <Text style={styles.label}>Passcode</Text>
      <TextInput
        value={passcode}
        onChangeText={(t) => setPasscode(t.replace(/\D/g, ""))}
        keyboardType="number-pad"
        maxLength={6}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity onPress={handleLogin} disabled={loading} style={styles.button}>
        <Text style={styles.buttonText}>{loading ? "Signing in..." : "Sign in"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text style={styles.link}>Don't have an account? Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
  },
  logo: {
    width: 64,
    height: 64,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 32,
    color: "#0F172A",
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#64748B",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
  },
  inputLocked: {
    backgroundColor: "#F1F5F9",
    color: "#475569",
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  link: {
    textAlign: "center",
    marginTop: 20,
    color: "#2563EB",
  },
});
