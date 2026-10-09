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
  const [limits, setLimits] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [canSubmit, setCanSubmit] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axiosClient.get("kyc/");
        setStatus(res.data.status || res.data.kyc_status || null);
        setRejectionReason(res.data.rejection_reason || "");
        setCanSubmit(res.data.can_submit !== false);
        setLimits(res.data.limits || null);
      } catch (err) {
        console.log("KYC status error:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchStatus();
  }, []);

  const handleSubmit = async () => {
    const bvnDigits = bvn.trim();
    const idDigits = idNumber.trim();

    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }

    // CHANGE: Tier 1 fintech rule is one identity, not both. Bureau lookup stays parked.
    if (!bvnDigits && !idDigits) {
      setError("Enter a BVN or a government ID number");
      return;
    }
    if (bvnDigits && bvnDigits.length !== 11) {
      setError("BVN must be 11 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axiosClient.post("kyc/submit/", {
        full_name: fullName.trim(),
        bvn: bvnDigits,
        id_number: idDigits,
      });
      setStatus("pending");
      Alert.alert(
        "Submitted",
        "Submitted for manual review. Payhost does not verify BVN or NIN with a bureau yet.",
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
        Enter a BVN or a government ID number. One is enough for this review.
      </Text>

      {status && (
        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Current Status</Text>
          <Text style={styles.statusValue}>{status.toUpperCase()}</Text>
        </View>
      )}

      {status === "rejected" && rejectionReason ? (
        <Text style={{ color: "#B91C1C", marginBottom: 16 }}>
          {rejectionReason}
        </Text>
      ) : null}

      {limits && (
        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Limits · {limits.label || "Basic"}</Text>
          <Text style={styles.statusValue}>
            ₦{Number(limits.single_send_ngn).toLocaleString()} per send
          </Text>
          <Text style={{ color: "#64748B", marginTop: 4 }}>
            ₦{Number(limits.daily_send_ngn).toLocaleString()} per day
          </Text>
          <Text style={{ color: "#64748B", marginTop: 4 }}>
            {limits.fx_enabled ? "FX convert enabled" : "FX convert after approval"}
          </Text>
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
        label="BVN (11 digits)"
        value={bvn}
        onChangeText={setBvn}
        mode="outlined"
        keyboardType="numeric"
        maxLength={11}
        style={styles.input}
      />

      <TextInput
        label="Government ID number (NIN, passport, licence, or voter card)"
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
        disabled={!canSubmit || status === "approved" || status === "pending"}
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