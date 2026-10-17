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
import * as ImagePicker from "expo-image-picker";
import axiosClient from "../src/api/axiosClient";
import Toast from "react-native-toast-message";

type KycLimits = {
  tier?: number | string;
  daily_send_limit?: number;
  per_send_limit?: number;
  remaining_today?: number;
  label?: string;
  single_send_ngn?: number;
  daily_send_ngn?: number;
  fx_enabled?: boolean;
};

function appendImage(
  formData: FormData,
  fieldName: string,
  asset: ImagePicker.ImagePickerAsset,
  fallbackName: string,
) {
  const nativeFormData = formData as unknown as {
    append(name: string, value: string | { uri: string; name: string; type: string }): void;
  };
  nativeFormData.append(fieldName, {
    uri: asset.uri,
    name: asset.fileName || fallbackName,
    type: asset.mimeType || "image/jpeg",
  });
}

export default function KycScreen() {
  const [nin, setNin] = useState("");
  const [idDocument, setIdDocument] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [proofOfAddress, setProofOfAddress] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [selfie, setSelfie] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [limits, setLimits] = useState<KycLimits | null>(null);
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

  const pickImage = async (
    label: string,
    setAsset: (asset: ImagePicker.ImagePickerAsset) => void,
  ) => {
    setError("");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setAsset(result.assets[0]);
      }
    } catch (err) {
      console.error(`Could not select ${label}:`, err);
      setError(`Could not select ${label}. Please try again.`);
    }
  };

  const handleUpgrade = async () => {
    const ninDigits = nin.trim();
    if (ninDigits && !/^\d{11}$/.test(ninDigits)) {
      setError("NIN must be 11 digits");
      return;
    }
    if (!ninDigits && !idDocument && !proofOfAddress && !selfie) {
      setError("Enter a NIN or select at least one document");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      if (ninDigits) formData.append("nin", ninDigits);
      if (idDocument) {
        appendImage(formData, "government_id", idDocument, "id.jpg");
      }
      if (proofOfAddress) {
        appendImage(formData, "proof_of_address", proofOfAddress, "poa.jpg");
      }
      if (selfie) {
        appendImage(formData, "selfie", selfie, "selfie.jpg");
      }

      const { data } = await axiosClient.post("kyc/upgrade/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLimits({
        tier: data.tier,
        daily_send_limit: data.daily_send_limit,
        per_send_limit: data.per_send_limit,
        remaining_today: data.remaining_today,
      });
      Toast.show({
        type: "success",
        text1: "Limits upgraded",
        text2: `Your account is now Tier ${data.tier}.`,
      });
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to upgrade limits. Please try again.";
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

  const dailyLimit = limits?.daily_send_limit ?? limits?.daily_send_ngn;
  const perSendLimit = limits?.per_send_limit ?? limits?.single_send_ngn;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Verify Identity</Text>
      <Text style={styles.subtitle}>
        Provide your NIN and any requested identity documents to upgrade your limits.
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
          <Text style={styles.statusLabel}>
            Limits · Tier {limits.tier ?? limits.label ?? "Basic"}
          </Text>
          {perSendLimit != null && (
            <Text style={styles.statusValue}>
              ₦{Number(perSendLimit).toLocaleString()} per send
            </Text>
          )}
          {dailyLimit != null && (
            <Text style={{ color: "#64748B", marginTop: 4 }}>
              ₦{Number(dailyLimit).toLocaleString()} per day
            </Text>
          )}
          {limits.remaining_today != null && (
            <Text style={{ color: "#64748B", marginTop: 4 }}>
              ₦{Number(limits.remaining_today).toLocaleString()} left today
            </Text>
          )}
          {limits.fx_enabled != null && (
            <Text style={{ color: "#64748B", marginTop: 4 }}>
              {limits.fx_enabled ? "FX convert enabled" : "FX convert after approval"}
            </Text>
          )}
        </View>
      )}

      <TextInput
        label="NIN (11 digits)"
        value={nin}
        onChangeText={setNin}
        mode="outlined"
        keyboardType="numeric"
        maxLength={11}
        style={styles.input}
      />

      <Text style={styles.uploadLabel}>Government ID image</Text>
      <Button
        mode="outlined"
        onPress={() => pickImage("government ID", setIdDocument)}
        style={styles.uploadButton}
      >
        {idDocument?.fileName || (idDocument ? "Image selected" : "Choose government ID image")}
      </Button>

      <Text style={styles.uploadLabel}>Proof of address</Text>
      <Button
        mode="outlined"
        onPress={() => pickImage("proof of address", setProofOfAddress)}
        style={styles.uploadButton}
      >
        {proofOfAddress?.fileName ||
          (proofOfAddress ? "Image selected" : "Choose proof of address image")}
      </Button>

      <Text style={styles.uploadLabel}>Selfie</Text>
      <Button
        mode="outlined"
        onPress={() => pickImage("selfie", setSelfie)}
        style={styles.uploadButton}
      >
        {selfie?.fileName || (selfie ? "Image selected" : "Choose selfie image")}
      </Button>

      {error ? (
        <HelperText type="error" visible={true}>
          {error}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={handleUpgrade}
        loading={loading}
        style={styles.button}
        contentStyle={{ paddingVertical: 6 }}
        disabled={
          status === "pending" ||
          (status !== "approved" && !canSubmit) ||
          loading
        }
      >
        {status === "pending"
          ? "Pending Review"
          : "Upgrade Limits"}
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
  uploadLabel: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  uploadButton: {
    marginBottom: 16,
    borderRadius: 10,
  },
  button: {
    marginTop: 12,
    borderRadius: 10,
  },
});