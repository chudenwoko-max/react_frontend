import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Button, TextInput, HelperText, Switch } from "react-native-paper";
import { router } from "expo-router";
import axiosClient from "../src/api/axiosClient";

export default function TwoFactorScreen() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [mode, setMode] = useState<"enable" | "disable" | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axiosClient.get("2fa/status/");
        setEnabled(res.data.enabled || res.data.is_enabled || false);
      } catch (err) {
        console.log("2FA status error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleToggle = async () => {
    setError("");
    setOtp("");
    setShowOtpInput(true);
    setMode(enabled ? "disable" : "enable");
  };

  const confirmAction = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      if (mode === "enable") {
        await axiosClient.post("2fa/enable/", { otp });
        setEnabled(true);
        Alert.alert("Success", "Two-Factor Authentication enabled");
      } else {
        await axiosClient.post("2fa/disable/", { otp });
        setEnabled(false);
        Alert.alert("Success", "Two-Factor Authentication disabled");
      }
      setShowOtpInput(false);
      setOtp("");
    } catch (err: any) {
      console.log("2FA error:", err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.detail || "Action failed");
    } finally {
      setActionLoading(false);
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
      <Text style={styles.title}>Two-Factor Authentication</Text>
      <Text style={styles.subtitle}>
        Add an extra layer of security to your account
      </Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>2FA Status</Text>
            <Text style={[styles.status, { color: enabled ? "#16A34A" : "#DC2626" }]}>
              {enabled ? "Enabled" : "Disabled"}
            </Text>
          </View>
          <Switch value={enabled} onValueChange={handleToggle} color="#0F172A" />
        </View>
      </View>

      {showOtpInput && (
        <View style={styles.otpSection}>
          <Text style={styles.otpTitle}>
            {mode === "enable" ? "Enable 2FA" : "Disable 2FA"}
          </Text>
          <Text style={styles.otpSubtitle}>
            Enter the OTP sent to your email/phone
          </Text>

          <TextInput
            label="OTP Code"
            value={otp}
            onChangeText={setOtp}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          {error ? <HelperText type="error">{error}</HelperText> : null}

          <Button
            mode="contained"
            onPress={confirmAction}
            loading={actionLoading}
            style={styles.button}
          >
            Confirm
          </Button>

          <Button
            mode="text"
            onPress={() => {
              setShowOtpInput(false);
              setOtp("");
              setError("");
            }}
          >
            Cancel
          </Button>
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
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  status: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },
  otpSection: {
    marginTop: 28,
  },
  otpTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  otpSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
    marginTop: 4,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
    borderRadius: 10,
  },
});