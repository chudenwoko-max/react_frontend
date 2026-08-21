import { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Text, HelperText } from "react-native-paper";
import { Link, router } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import axiosClient from "../../src/api/axiosClient";
import axios from "axios";
import { getDeviceFingerprint } from "../../src/utils/deviceFingerprint";

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const fingerprint = await getDeviceFingerprint();

      const res = await axiosClient.post("login/", {
        username,
        password,
        device_fingerprint: fingerprint,
      });

      // Check if 2FA is required
      if (res.data.requires_2fa) {
        setUserId(res.data.user_id);
        setShow2FA(true);
        setLoading(false);
        return;
      }

      // Normal login
      await login(res.data.access, res.data.refresh);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.log("FULL LOGIN ERROR:", error);

      let message = "Unable to log in. Please try again.";

      if (error.response) {
        message =
          error.response.data?.error ||
          error.response.data?.detail ||
          JSON.stringify(error.response.data);
      } else if (error.request) {
        message = "Network error. Cannot reach the server.";
      } else {
        message = error.message || message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axiosClient.post("2fa/verify-login/", {
        user_id: userId,
        code: otpCode,
      });

      await login(res.data.access, res.data.refresh);
      router.replace("/(tabs)");
    } catch (error: any) {
      setError(error.response?.data?.error || "Invalid authentication code");
    } finally {
      setLoading(false);
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
        {show2FA && (
          <>
            <Text style={{ marginBottom: 12, color: "#64748B" }}>
              Enter the 6-digit code from your authenticator app
            </Text>
            <TextInput
              label="Authentication Code"
              value={otpCode}
              onChangeText={setOtpCode}
              mode="outlined"
              keyboardType="numeric"
              maxLength={6}
              style={styles.input}
            />
          </>
        )}

        {error ? (
          <HelperText type="error" visible={true}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={show2FA ? handleVerify2FA : handleLogin}
          loading={loading}
          style={styles.button}
          contentStyle={{ paddingVertical: 6 }}
        >
          {show2FA ? "Verify Code" : "Login"}
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