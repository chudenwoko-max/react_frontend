import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import axiosClient from "../src/api/axiosClient";

export default function TwoFactorScreen() {
  const [loading, setLoading] = useState(true);
  const [settingUp, setSettingUp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await axiosClient.get("2fa/status/");
      setIsEnabled(res.data.is_2fa_enabled);
    } catch (err) {
      console.log("2FA status error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startSetup = async () => {
    setSettingUp(true);
    setError("");
    try {
      const res = await axiosClient.post("2fa/setup/");
      setQrCode(res.data.qr_code);
      setSecret(res.data.secret);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to start 2FA setup");
    } finally {
      setSettingUp(false);
    }
  };

  const verifySetup = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setVerifying(true);
    setError("");
    try {
      await axiosClient.post("2fa/verify-setup/", { code });
      Alert.alert("Success", "Two-Factor Authentication enabled!");
      setIsEnabled(true);
      setQrCode(null);
      setCode("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid code");
    } finally {
      setVerifying(false);
    }
  };

  const disable2FA = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter your current 6-digit code to disable");
      return;
    }

    setVerifying(true);
    setError("");
    try {
      await axiosClient.post("2fa/disable/", { code });
      Alert.alert("Success", "Two-Factor Authentication has been disabled");
      setIsEnabled(false);
      setCode("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid code");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
      </TouchableOpacity>

      <Text style={styles.title}>Two-Factor Authentication</Text>
      <Text style={styles.subtitle}>
        Add an extra layer of security to your account using Google Authenticator or Authy.
      </Text>

      {isEnabled ? (
        <View style={styles.statusCard}>
          <MaterialCommunityIcons name="shield-check" size={40} color="#16A34A" />
          <Text style={styles.statusText}>2FA is currently enabled</Text>

          <TextInput
            label="Enter current 6-digit code to disable"
            value={code}
            onChangeText={setCode}
            mode="outlined"
            keyboardType="numeric"
            maxLength={6}
            style={styles.input}
          />

          {error ? <HelperText type="error">{error}</HelperText> : null}

          <Button
            mode="contained"
            onPress={disable2FA}
            loading={verifying}
            buttonColor="#DC2626"
            style={styles.button}
          >
            Disable 2FA
          </Button>
        </View>
      ) : (
        <View>
          {!qrCode ? (
            <Button
              mode="contained"
              onPress={startSetup}
              loading={settingUp}
              style={styles.button}
            >
              Enable Two-Factor Authentication
            </Button>
          ) : (
            <View style={styles.setupCard}>
              <Text style={styles.stepTitle}>1. Scan this QR code</Text>
              <Image
                source={{ uri: qrCode }}
                style={styles.qrCode}
                resizeMode="contain"
              />

              <Text style={styles.secretLabel}>Or enter this secret manually:</Text>
              <Text style={styles.secret}>{secret}</Text>

              <Text style={styles.stepTitle}>2. Enter the 6-digit code</Text>
              <TextInput
                label="6-digit code"
                value={code}
                onChangeText={setCode}
                mode="outlined"
                keyboardType="numeric"
                maxLength={6}
                style={styles.input}
              />

              {error ? <HelperText type="error">{error}</HelperText> : null}

              <Button
                mode="contained"
                onPress={verifySetup}
                loading={verifying}
                style={styles.button}
              >
                Verify & Enable
              </Button>
            </View>
          )}
        </View>
      )}
    </ScrollView>
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
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 28,
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#16A34A",
    marginVertical: 16,
  },
  setupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 12,
  },
  qrCode: {
    width: 220,
    height: 220,
    alignSelf: "center",
    marginBottom: 16,
  },
  secretLabel: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 4,
  },
  secret: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 24,
    letterSpacing: 1,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
    borderRadius: 10,
  },
});