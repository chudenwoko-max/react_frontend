import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CameraView, useCameraPermissions } from "expo-camera";
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
  files: Record<string, { uri: string; fileName?: string; mimeType?: string }>;
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

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
];

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

function appendImage(formData: FormData, fieldName: string, asset: { uri: string; fileName?: string; mimeType?: string }) {
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
  const [limits, setLimits] = useState<KycResponse["limits"] | null>(null);
  const [fieldState, setFieldState] = useState<KycFieldState>({ values: {}, files: {} });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [refreshAttempt, setRefreshAttempt] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [choiceVisible, setChoiceVisible] = useState(false);
  const [choiceField, setChoiceField] = useState<string | null>(null);

  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraField, setCameraField] = useState<string | null>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [crop, setCrop] = useState({ top: 0.15, left: 0.1, right: 0.1, bottom: 0.25 });

  const createCornerResponder = (corner: "tl" | "tr" | "bl" | "br") =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        setCrop((prev) => {
          const next = { ...prev };
          const sensitivity = 0.0015;
          if (corner === "tl" || corner === "bl") next.left = Math.max(0, Math.min(0.7, prev.left + gesture.dx * sensitivity));
          if (corner === "tr" || corner === "br") next.right = Math.max(0, Math.min(0.7, prev.right - gesture.dx * sensitivity));
          if (corner === "tl" || corner === "tr") next.top = Math.max(0, Math.min(0.7, prev.top + gesture.dy * sensitivity));
          if (corner === "bl" || corner === "br") next.bottom = Math.max(0, Math.min(0.7, prev.bottom - gesture.dy * sensitivity));
          return next;
        });
      },
    });

  const tlResponder = createCornerResponder("tl");
  const trResponder = createCornerResponder("tr");
  const blResponder = createCornerResponder("bl");
  const brResponder = createCornerResponder("br");

  const isApproved = ["approved", "verified"].includes(status.toLowerCase());
  const currentTier = Number(limits?.tier ?? 0);

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

  const openChoice = (field: string) => {
    setChoiceField(field);
    setChoiceVisible(true);
  };

  const openCamera = async (field: string) => {
    setChoiceVisible(false);
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setError("Camera permission is required.");
        return;
      }
    }
    setCameraField(field);
    setCapturedUri(null);
    setCameraVisible(true);
  };

  const pickFromGallery = async (field: string) => {
    setChoiceVisible(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setFieldState((current) => ({
        ...current,
        files: {
          ...current.files,
          [field]: {
            uri: result.assets[0].uri,
            fileName: result.assets[0].fileName || `${field}.jpg`,
            mimeType: result.assets[0].mimeType || "image/jpeg",
          },
        },
      }));
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    setCapturedUri(photo.uri);
  };

  const acceptPhoto = () => {
    if (!cameraField || !capturedUri) return;
    setFieldState((current) => ({
      ...current,
      files: {
        ...current.files,
        [cameraField]: { uri: capturedUri, fileName: `${cameraField}.jpg`, mimeType: "image/jpeg" },
      },
    }));
    setCameraVisible(false);
    setCapturedUri(null);
    setCameraField(null);
  };

  const retakePhoto = () => {
    setCapturedUri(null);
  };

  const handleUpgrade = async () => {
    if (!missing || missing.length === 0) return;
    if (!targetTier) {
      setError("Your KYC status did not include a target tier. Please refresh your status or contact support.");
      return;
    }

    const fieldsToCheck = isApproved ? ["nin", "proof_of_address", "government_id", "selfie"] : missing;

    if (isApproved) {
      const nin = fieldState.values.nin?.trim();
      if (nin && !/^\d{11}$/.test(nin)) {
        setError("NIN must be exactly 11 digits.");
        return;
      }
      const hasData = Boolean(nin) || ["proof_of_address", "government_id", "selfie"].some((f) => fieldState.files[f]);
      if (!hasData) {
        setError("Enter your NIN or capture at least one document.");
        return;
      }
    } else {
      const incomplete = fieldsToCheck.filter((field) =>
        fileFields.has(field) ? !fieldState.files[field] : !fieldState.values[field]?.trim(),
      );
      if (incomplete.length > 0) {
        setError(`Complete all requested fields: ${incomplete.map(getFieldLabel).join(", ")}.`);
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      if (isApproved) {
        if (fieldState.values.nin?.trim()) formData.append("nin", fieldState.values.nin.trim());
        ["proof_of_address", "government_id", "selfie"].forEach((field) => {
          if (fieldState.files[field]) appendImage(formData, field, fieldState.files[field]);
        });
      } else {
        for (const field of missing) {
          if (fileFields.has(field)) {
            if (fieldState.files[field]) appendImage(formData, field, fieldState.files[field]);
          } else if (fieldState.values[field]?.trim()) {
            formData.append(field, fieldState.values[field].trim());
          }
        }
      }

      const endpoint = isApproved ? `kyc/upgrade/${encodeURIComponent(targetTier)}/` : "kyc/submit/";
      await axiosClient.post(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });

      Alert.alert("Success", isApproved ? "KYC documents updated" : "KYC submitted — awaiting approval", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Failed to upgrade your tier. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const iso = selectedDate.toISOString().split("T")[0];
      setFieldState((c) => ({ ...c, values: { ...c.values, date_of_birth: iso } }));
    }
  };

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  const fieldsToRender = isApproved ? ["nin", "proof_of_address", "government_id", "selfie"] : missing || [];

  if (cameraVisible) {
    return (
      <View style={styles.cameraContainer}>
        {!capturedUri ? (
          <>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={cameraField === "selfie" ? "front" : "back"}
            />
            <View style={styles.cameraControls}>
              <Button mode="contained" onPress={takePicture} style={styles.captureBtn}>
                Capture
              </Button>
              <Button mode="outlined" onPress={() => setCameraVisible(false)} textColor="#fff">
                Cancel
              </Button>
            </View>
          </>
        ) : (
          <View style={styles.previewContainer}>
            <Image source={{ uri: capturedUri }} style={styles.fullPreview} />

            <View
              style={[
                styles.cropFrame,
                {
                  top: `${crop.top * 100}%`,
                  left: `${crop.left * 100}%`,
                  right: `${crop.right * 100}%`,
                  bottom: `${crop.bottom * 100}%`,
                },
              ]}
            >
              <View {...tlResponder.panHandlers} style={[styles.corner, styles.cornerTL]} />
              <View {...trResponder.panHandlers} style={[styles.corner, styles.cornerTR]} />
              <View {...blResponder.panHandlers} style={[styles.corner, styles.cornerBL]} />
              <View {...brResponder.panHandlers} style={[styles.corner, styles.cornerBR]} />
            </View>

            <TouchableOpacity style={styles.cropButton}>
              <Text style={styles.cropButtonText}>Crop</Text>
            </TouchableOpacity>

            <View style={styles.previewActions}>
              <Button mode="outlined" onPress={retakePhoto} textColor="#fff" style={styles.previewBtn}>
                Retake
              </Button>
              <Button mode="contained" onPress={acceptPhoto} style={styles.previewBtn}>
                Accept
              </Button>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Verify your identity</Text>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>Tier {currentTier} of 3</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(100, (currentTier / 3) * 100)}%` },
            ]}
          />
        </View>
      </View>

      {status ? <Text style={styles.status}>Status: {status.toUpperCase()}</Text> : null}

      {/* Clearer next-tier message */}
      <Text style={styles.subtitle}>
        {isApproved
          ? missing && missing.length > 0
            ? `Complete ${missing.length} more item${missing.length > 1 ? "s" : ""} to reach the next tier and unlock higher limits.`
            : "You are at the highest tier."
          : "Provide the information below to start verification and unlock higher limits."}
      </Text>

      {missing === null ? (
        <Button mode="outlined" onPress={() => setRefreshAttempt((a) => a + 1)}>Retry</Button>
      ) : missing.length === 0 ? (
        <Text style={styles.message}>You are at the highest tier.</Text>
      ) : (
        <>
          {!targetTier && (
            <HelperText type="error" visible>
              Your KYC status did not include a target tier. Please refresh your status or contact support.
            </HelperText>
          )}

          {fieldsToRender.map((field) =>
            fileFields.has(field) ? (
              <View key={field} style={styles.field}>
                <Text style={styles.fieldLabel}>{getFieldLabel(field)}</Text>
                {(field === "government_id" || field === "selfie") && (
                  <Button
                    mode="outlined"
                    onPress={() => openChoice(field)}
                    style={{ marginTop: 8 }}
                    textColor="#0F172A"
                  >
                    {fieldState.files[field] ? "Change" : field === "selfie" ? "Add selfie" : "Add document"}
                  </Button>
                )}
                {fieldState.files[field] && <Text style={styles.captured}>✓ Captured</Text>}
              </View>
            ) : field === "gender" ? (
              <View key={field} style={styles.field}>
                <Text style={styles.fieldLabel}>{getFieldLabel(field)}</Text>
                <Picker
                  selectedValue={fieldState.values[field] || ""}
                  onValueChange={(value) =>
                    setFieldState((c) => ({ ...c, values: { ...c.values, [field]: value } }))
                  }
                  style={styles.picker}
                  dropdownIconColor="#0F172A"
                >
                  <Picker.Item label="Select gender" value="" color="#0F172A" />
                  <Picker.Item label="Male" value="male" color="#0F172A" />
                  <Picker.Item label="Female" value="female" color="#0F172A" />
                  <Picker.Item label="Other" value="other" color="#0F172A" />
                </Picker>
              </View>
            ) : field === "state" ? (
              <View key={field} style={styles.field}>
                <Text style={styles.fieldLabel}>{getFieldLabel(field)}</Text>
                <Picker
                  selectedValue={fieldState.values[field] || ""}
                  onValueChange={(value) =>
                    setFieldState((c) => ({ ...c, values: { ...c.values, [field]: value } }))
                  }
                  style={styles.picker}
                  dropdownIconColor="#0F172A"
                >
                  <Picker.Item label="Select state" value="" color="#0F172A" />
                  {nigerianStates.map((state) => (
                    <Picker.Item key={state} label={state} value={state} color="#0F172A" />
                  ))}
                </Picker>
              </View>
            ) : field === "government_id_type" ? (
              <View key={field} style={styles.field}>
                <Text style={styles.fieldLabel}>{getFieldLabel(field)}</Text>
                <Picker
                  selectedValue={fieldState.values[field] || ""}
                  onValueChange={(value) =>
                    setFieldState((c) => ({ ...c, values: { ...c.values, [field]: value } }))
                  }
                  style={styles.picker}
                  dropdownIconColor="#0F172A"
                >
                  <Picker.Item label="Select ID type" value="" color="#0F172A" />
                  <Picker.Item label="National ID (NIN Slip / Card)" value="national_id" color="#0F172A" />
                  <Picker.Item label="International Passport" value="passport" color="#0F172A" />
                  <Picker.Item label="Driver's Licence" value="drivers_license" color="#0F172A" />
                  <Picker.Item label="Voter's Card (PVC)" value="voters_card" color="#0F172A" />
                </Picker>
              </View>
            ) : field === "date_of_birth" ? (
              <View key={field} style={styles.field}>
                <Text style={styles.fieldLabel}>{getFieldLabel(field)}</Text>
                <Button mode="outlined" onPress={() => setShowDatePicker(true)} textColor="#0F172A">
                  {fieldState.values[field] || "Select date of birth"}
                </Button>
                {showDatePicker && (
                  <DateTimePicker
                    value={fieldState.values[field] ? new Date(fieldState.values[field]) : new Date(2000, 0, 1)}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>
            ) : (
              <TextInput
                key={field}
                label={getFieldLabel(field)}
                value={fieldState.values[field] || ""}
                onChangeText={(value) =>
                  setFieldState((c) => ({
                    ...c,
                    values: {
                      ...c.values,
                      [field]:
                        field === "nin" || field === "bvn" || field === "phone_number"
                          ? value.replace(/\D/g, "")
                          : value,
                    },
                  }))
                }
                mode="outlined"
                textColor="#0F172A"
                outlineColor="#E2E8F0"
                activeOutlineColor="#0F172A"
                keyboardType={
                  field === "nin" || field === "bvn" || field === "phone_number" ? "phone-pad" : "default"
                }
                maxLength={field === "nin" || field === "bvn" ? 11 : undefined}
                style={styles.input}
              />
            ),
          )}

          <Button mode="contained" onPress={handleUpgrade} loading={loading} disabled={loading || !targetTier} style={styles.submit}>
            {loading ? "Submitting..." : "Upgrade tier"}
          </Button>
        </>
      )}
      {error ? (
        <HelperText type="error" visible style={styles.errorText}>
          {error}
        </HelperText>
      ) : null}

      <Modal visible={choiceVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.choiceSheet}>
            <Text style={styles.choiceTitle}>
              {choiceField === "selfie" ? "Add selfie" : "Add document"}
            </Text>
            <Button mode="contained" onPress={() => choiceField && openCamera(choiceField)} style={styles.choiceBtn}>
              Scan / Take photo
            </Button>
            <Button mode="outlined" onPress={() => choiceField && pickFromGallery(choiceField)} style={styles.choiceBtn} textColor="#0F172A">
              Upload from gallery
            </Button>
            <Button onPress={() => setChoiceVisible(false)}>Cancel</Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 32 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  title: { fontSize: 26, fontWeight: "700", color: "#0F172A", marginBottom: 12 },
  progressContainer: { marginBottom: 16 },
  progressLabel: { fontSize: 14, color: "#475569", marginBottom: 6, fontWeight: "600" },
  progressBar: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0F172A",
    borderRadius: 3,
  },
  subtitle: { color: "#64748B", marginBottom: 16, fontSize: 15, lineHeight: 22 },
  status: { color: "#475569", marginBottom: 8 },
  message: { color: "#166534", fontSize: 16, fontWeight: "600", marginTop: 12 },
  field: { marginBottom: 16 },
  fieldLabel: { color: "#334155", fontWeight: "600", marginBottom: 8 },
  input: { backgroundColor: "#FFFFFF", marginBottom: 16 },
  picker: { backgroundColor: "#FFFFFF", color: "#0F172A" },
  captured: { color: "#166534", fontWeight: "600", marginTop: 6 },
  submit: { marginTop: 8 },
  errorText: { fontSize: 16, marginTop: 12 },
  cameraContainer: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  cameraControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 12,
  },
  captureBtn: { width: 200 },
  previewContainer: { flex: 1, backgroundColor: "#000" },
  fullPreview: { flex: 1, resizeMode: "contain" },
  cropFrame: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 4,
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#fff",
  },
  cornerTL: { top: -4, left: -4, borderTopWidth: 5, borderLeftWidth: 5 },
  cornerTR: { top: -4, right: -4, borderTopWidth: 5, borderRightWidth: 5 },
  cornerBL: { bottom: -4, left: -4, borderBottomWidth: 5, borderLeftWidth: 5 },
  cornerBR: { bottom: -4, right: -4, borderBottomWidth: 5, borderRightWidth: 5 },
  cropButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cropButtonText: { color: "#fff", fontWeight: "600" },
  previewActions: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  previewBtn: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  choiceSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 40,
  },
  choiceTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A", marginBottom: 16, textAlign: "center" },
  choiceBtn: { marginBottom: 12 },
});