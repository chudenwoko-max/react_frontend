import { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Text, HelperText } from "react-native-paper";
import { Link, router } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import axiosClient from "../../src/api/axiosClient";
import axios from "axios";

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axiosClient.post("login/", {
  username,
  password,
});

      await login(res.data.access, res.data.refresh);
      router.replace("/(tabs)");
    } catch (error: any) {
  if (axios.isAxiosError(error)) {
    console.log("Login API failed:", {
      status: error.response?.status,
      data: error.response?.data,
    });
  } else {
    console.error("Unexpected login error:", error);
  }

  setError(
    error.response?.data?.error ||
    error.response?.data?.detail ||
    "Unable to log in. Please try again."
  );
}
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text variant="headlineMedium" style={styles.title}>
          OrbitPay
        </Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />

        {error ? (
          <HelperText type="error" visible={true}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
          contentStyle={{ paddingVertical: 6 }}
        >
          Login
        </Button>
        <Link href="/(auth)/register" asChild>
  <Button mode="text" style={{ marginTop: 16 }}>
    Don't have an account? Register
  </Button>
</Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#64748B",
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 10,
  },
});