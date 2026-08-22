import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { router } from "expo-router";
import axiosClient from "../src/api/axiosClient";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [debugToken, setDebugToken] = useState("");

  const handleRequest = async () => {
    if (!email) {
      setError("Please enter your email or username");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axiosClient.post("password-reset/request/", {
        email: email,
      });

      setSuccess(true);
      if (res.data.debug_token) {
        setDebugToken(res.data.debug_token);
      }

      Alert.alert(
        "Check your email",
        "If an account exists, a reset link has been sent."
      );
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email or username and we’ll send you a reset link.
        </Text>

        <TextInput
          label="Email or Username"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          autoCapitalize="none"
          style={styles.input}
        />

        {error ? <HelperText type="error">{error}</HelperText> : null}

        {success && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              Reset request sent successfully.
            </Text>
            {debugToken ? (
              <Text style={styles.debugText}>
                Debug Token: {debugToken}
              </Text>
            ) : null}
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleRequest}
          loading={loading}
          style={styles.button}
        >
          Send Reset Link
        </Button>

        <Button mode="text" onPress={() => router.back()} style={{ marginTop: 12 }}>
          Back to Login
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
    marginBottom: 8,
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
    marginTop: 8,
    borderRadius: 10,
  },
  successBox: {
    backgroundColor: "#DCFCE7",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  successText: {
    color: "#166534",
    fontWeight: "600",
  },
  debugText: {
    marginTop: 8,
    fontSize: 12,
    color: "#166534",
  },
});