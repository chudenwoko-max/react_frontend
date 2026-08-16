import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { router } from "expo-router";
import axiosClient from "../src/api/axiosClient";

export default function KycScreen() {
  const [fullName, setFullName] = useState("");
  const [bvn, setBvn] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axiosClient.get("kyc/");
        setStatus(res.data.status || res.data.kyc_status || null);
      } catch (err) {
        console.log("KYC status error:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchStatus();
  }, []);

  const handleSubmit = async () => {
    if (!fullName || !bvn) {
      setError("Full name and BVN are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axiosClient.post("kyc/submit/", {
        full_name: fullName,
        bvn: bvn,
        id_number: idNumber || "",
      });

      Alert.alert(
        "Submitted",
        "Your KYC documents have been submitted for review.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err: any) {
      console.log("KYC submit error:", err.response?.data);
      const message =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to submit KYC. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Verify Identity</Text>
      <Text style={styles.subtitle}>
        Complete KYC to unlock higher limits
      </Text>

      {status && (
        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Current Status</Text>
          <Text style={styles.statusValue}>{status.toUpperCase()}</Text>
        </View>
      )}

      <TextInput
        label="Full Name"
        value={fullName}
        onChangeText={setFullName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="BVN"
        value={bvn}
        onChangeText={setBvn}
        mode="outlined"
        keyboardType="numeric"
        maxLength={11}
        style={styles.input}
      />

      <TextInput
        label="ID Number (optional)"
        value={idNumber}
        onChangeText={setIdNumber}
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
        onPress={handleSubmit}
        loading={loading}
        style={styles.button}
        contentStyle={{ paddingVertical: 6 }}
        disabled={status === "approved" || status === "pending"}
      >
        {status === "approved"
          ? "Already Verified"
          : status === "pending"
          ? "Pending Review"
          : "Submit KYC"}
      </Button>
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
    marginBottom: 24,
  },
  statusBox: {
    backgroundColor: "#F1F5F9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 4,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 12,
    borderRadius: 10,
  },
});