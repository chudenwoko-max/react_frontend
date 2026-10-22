import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import axios from "axios";
import axiosClient from "../src/api/axiosClient";

type KycResponse = {
  status?: string;
  missing?: string[];
  target_tier?: string | number;
  next_tier?: string | number;
  ts?: string | number;
  limits?: {
    tier?: string | number;
    daily_send_limit?: number;
    per_send_limit?: number;
    remaining_today?: number;
  };
};

type KycFieldState = {
  values: Record<string, string>;
  files: Record<string, ImagePicker.ImagePickerAsset>;
};

const fileFields = new Set(["government_id", "proof_of_address", "selfie"]);
const fieldLabels: Record<string, string> = {
  full_name: "Full legal name",
  date_of_birth: "Date of birth",
  gender: "Gender",
  phone_number: "Phone number",
  bvn: "BVN (11 digits)",
  nin: "NIN (11 digits)",
  address: "Street address",
  city: "City",
  state: "State",
  country: "Country",
  government_id_type: "Government ID type",
  government_id: "Government ID",
  proof_of_address: "Proof of address",
  selfie: "Selfie",
};

function getFieldLabel(field: string) {
  return fieldLabels[field] || field.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getTargetTier(data: KycResponse) {
  const tier = data.target_tier ?? data.next_tier ?? data.ts;
  return tier === "" || tier == null ? null : String(tier);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; detail?: string } | undefined;
    return data?.error || data?.detail || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

function appendImage(
  formData: FormData,
  fieldName: string,
  asset: ImagePicker.ImagePickerAsset,
) {
  if (Platform.OS === "web" && asset.file) {
    formData.append(fieldName, asset.file, asset.fileName || `${fieldName}.jpg`);
    return;
  }

  const nativeFormData = formData as unknown as {
    append(name: string, value: { uri: string; name: string; type: string }): void;
  };
  nativeFormData.append(fieldName, {
    uri: asset.uri,
    name: asset.fileName || `${fieldName}.jpg`,
    type: asset.mimeType || "image/jpeg",
  });
}

export default function KycScreen() {
  const [status, setStatus] = useState("");
  const [missing, setMissing] = useState<string[] | null>(null);
  const [targetTier, setTargetTier] = useState<string | null>(null);
  const [limits, setLimits] = useState<KycResponse["limits"]>(null);
  const [fieldState, setFieldState] = useState<KycFieldState>({ values: {}, files: {} });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [refreshAttempt, setRefreshAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchStatus = async () => {
      setFetching(true);
      setError("");
      try {
        const { data } = await axiosClient.get<KycResponse>("kyc/");
        if (!Array.isArray(data.missing) || data.missing.some((field) => typeof field !== "string")) {
          throw new Error("KYC status response did not include a valid missing requirements list.");
        }
        if (!active) return;
        setStatus(data.status || "");
        setMissing(data.missing);
        setTargetTier(getTargetTier(data));
        setLimits(data.limits || null);
      } catch (fetchError) {
        if (active) {
          setMissing(null);
          setError(getErrorMessage(fetchError, "Could not load your KYC status. Please try again."));
        }
      } finally {
        if (active) setFetching(false);
      }
    };

    fetchStatus();
    return () => {
      active = false;
    };
  }, [refreshAttempt]);

  const pickImage = async (field: string) => {
    setError("");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setFieldState((current) => ({
          ...current,
          files: { ...current.files, [field]: result.assets[0] },
        }));
      }
    } catch (pickError) {
      setError(getErrorMessage(pickError, `Could not select ${getFieldLabel(field)}. Please try again.`));
    }
  };

  const handleUpgrade = async () => {
    if (!missing || missing.length === 0) return;
    if (!targetTier) {
      setError("Your KYC status did not include a target tier. Please refresh your status or contact support.");
      return;
    }

    const incomplete = missing.filter((field) =>
      fileFields.has(field) ? !fieldState.files[field] : !fieldState.values[field]?.trim(),
    );
    if (incomplete.length > 0) {
      setError(`Complete all requested fields: ${incomplete.map(getFieldLabel).join(", ")}.`);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      for (const field of missing) {
        if (fileFields.has(field)) appendImage(formData, field, fieldState.files[field]);
        else formData.append(field, fieldState.values[field].trim());
      }

      await axiosClient.post(
        `kyc/upgrade/${encodeURIComponent(targetTier)}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (Platform.OS === "web") {
        window.alert("Tier upgraded successfully");
        router.back();
      } else {
        Alert.alert("Success", "Tier upgraded successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Failed to upgrade your tier. Please try again."));
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Verify Identity</Text>
      {status ? <Text style={styles.status}>Current status: {status.toUpperCase()}</Text> : null}
      {limits?.tier != null ? <Text style={styles.status}>Current tier: {limits.tier}</Text> : null}

      {missing === null ? (
        <Button mode="outlined" onPress={() => setRefreshAttempt((attempt) => attempt + 1)}>
          Retry
        </Button>
      ) : missing.length === 0 ? (
        <Text style={styles.message}>You are at the highest tier.</Text>
      ) : (
        <>
          <Text style={styles.subtitle}>Provide only the remaining information requested for your account.</Text>
          {!targetTier ? (
            <HelperText type="error" visible>
              Your KYC status did not include a target tier. Please refresh your status or contact support.
            </HelperText>
          ) : null}
          {missing.map((field) =>
            fileFields.has(field) ? (
              <View key={field} style={styles.field}>
                <Text style={styles.fieldLabel}>{getFieldLabel(field)}</Text>
                <Button mode="outlined" onPress={() => pickImage(field)}>
                  {fieldState.files[field]?.fileName || `Choose ${getFieldLabel(field).toLowerCase()}`}
                </Button>
              </View>
            ) : (
              <TextInput
                key={field}
                label={getFieldLabel(field)}
                value={fieldState.values[field] || ""}
                onChangeText={(value) =>
                  setFieldState((current) => ({
                    ...current,
                    values: { ...current.values, [field]: value },
                  }))
                }
                mode="outlined"
                keyboardType={field === "nin" || field === "bvn" ? "numeric" : "default"}
                maxLength={field === "nin" || field === "bvn" ? 11 : undefined}
                style={styles.field}
              />
            ),
          )}
          <Button
            mode="contained"
            onPress={handleUpgrade}
            loading={loading}
            disabled={loading || !targetTier}
            style={styles.submit}
          >
            {loading ? "Submitting..." : "Upgrade tier"}
          </Button>
        </>
      )}
      {error ? <HelperText type="error" visible>{error}</HelperText> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 32 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  title: { fontSize: 26, fontWeight: "700", color: "#0F172A", marginBottom: 12 },
  subtitle: { color: "#64748B", marginBottom: 16 },
  status: { color: "#475569", marginBottom: 8 },
  message: { color: "#166534", fontSize: 16, fontWeight: "600", marginTop: 12 },
  field: { marginBottom: 16 },
  fieldLabel: { color: "#334155", fontWeight: "600", marginBottom: 8 },
  submit: { marginTop: 8 },
});
