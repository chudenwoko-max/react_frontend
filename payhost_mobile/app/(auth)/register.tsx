import { useState } from "react";
import { Image, View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { TextInput, Button, Text, HelperText } from "react-native-paper";
import { Link, router } from "expo-router";
import axiosClient from "../../src/api/axiosClient";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!username || !email || !passcode) {
      setError("Please fill in all fields");
      return;
    }

    if (passcode.length !== 6) {
      setError("Enter a 6-digit passcode");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axiosClient.post("register/", {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        passcode,
      });

      router.replace("/(auth)/login");
    } catch (err: any) {
      console.log("Register error:", err.response?.data);

      const message =
        err.response?.data?.error ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.passcode?.[0] ||
        "Registration failed. Please try again.";
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
        <Image
          source={require("../../assets/payhost-mark.png")}
          style={styles.logo}
        />

        <Text style={styles.subtitle}>Join Payhost today</Text>

        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          autoCapitalize="none"
          style={styles.input}
          theme={{ colors: { background: "#FFFFFF" } }}
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          theme={{ colors: { background: "#FFFFFF" } }}
        />

        <TextInput
          label="6-digit passcode"
          value={passcode}
          onChangeText={(text) => setPasscode(text.replace(/\D/g, ""))}
          mode="outlined"
          keyboardType="numeric"
          maxLength={6}
          secureTextEntry
          style={styles.input}
          theme={{ colors: { background: "#FFFFFF" } }}
        />

        {error ? (
          <HelperText type="error" visible={true}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          style={styles.button}
          buttonColor="#2563EB"
          contentStyle={{ paddingVertical: 6 }}
        >
          Register
        </Button>

        <Link href="/(auth)/login" asChild>
          <Button mode="text" textColor="#000000" style={{ marginTop: 16 }}>
            Already have an account? Login
          </Button>
        </Link>
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
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    width: 64,
    height: 64,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 12,
  },
  subtitle: {
    textAlign: "center",
    color: "#64748B",
    marginBottom: 32,
    fontSize: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  button: {
    marginTop: 8,
    borderRadius: 10,
  },
});