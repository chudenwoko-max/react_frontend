import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import axios from "axios";
import axiosClient from "../src/api/axiosClient";

const fileFields = new Set(["government_id", "proof_of_address", "selfie"]);
const fieldLabels = {
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

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
];

function getFieldLabel(field) {
  return fieldLabels[field] || field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function RequiredLabel({ children }) {
  return (
    <Text style={styles.fieldLabel}>
      {children}
      <Text style={{ color: "#DC2626" }}> *</Text>
    </Text>
  );
}

function getTargetTier(data) {
  const tier = data.target_tier ?? data.next_tier;
  return tier == null || tier === "" ? null : String(tier);
}

function getErrorMessage(error, fallback) {
  if (axios.isAxiosError(error)) {
    const data = error.response && error.response.data;
    return data?.error || data?.detail || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

function appendImage(formData, fieldName, asset) {
  if (Platform.OS === "web" && asset.file) {
    formData.append(fieldName, asset.file, asset.fileName || `${fieldName}.jpg`);
    return;
  }
  formData.append(fieldName, {
    uri: asset.uri,
    name: asset.fileName || `${fieldName}.jpg`,
    type: asset.mimeType || "image/jpeg",
  });
}

export default function KycScreen() {
  const [status, setStatus] = useState("");
  const [missing, setMissing] = useState(null);
  const [targetTier, setTargetTier] = useState(null);
  const [limits, setLimits] = useState(null);
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [refreshAttempt, setRefreshAttempt] = useState(0);
  const [backendHasBvn, setBackendHasBvn] = useState(false);
  const [backendHasNin, setBackendHasNin] = useState(false);
  const [backendHasProofOfAddress, setBackendHasProofOfAddress] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraField, setCameraField] = useState(null);
  const [capturedUri, setCapturedUri] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const isApproved = ["approved", "verified"].includes(status.toLowerCase());

  useEffect(() => {
    let active = true;
    const fetchStatus = async () => {
      setFetching(true);
      setError("");
      try {
        const { data } = await axiosClient.get("kyc/");
        if (!Array.isArray(data.missing)) throw new Error("Invalid KYC response");
        if (!active) return;
        setStatus(data.status || "");
        setMissing(data.missing);
        setTargetTier(getTargetTier(data));
        setLimits(data.limits || null);
        setBackendHasBvn(!!data.bvn);
        setBackendHasNin(!!data.nin);
        setBackendHasProofOfAddress(!!data.has_proof_of_address || !!data.proof_of_address);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Could not load your KYC status."));
      } finally {
        if (active) setFetching(false);
      }
    };
    fetchStatus();
    return () => { active = false; };
  }, [refreshAttempt]);

  const openCamera = async (field) => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        setError("Camera permission required.");
        return;
      }
    }
    setCameraField(field);
    setCapturedUri(null);
    setCameraOpen(true);
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
    setCapturedUri(photo.uri);
  };

  const acceptPhoto = () => {
    if (!capturedUri || !cameraField) return;
    setFiles((prev) => ({
      ...prev,
      [cameraField]: { uri: capturedUri, fileName: `${cameraField}.jpg`, mimeType: "image/jpeg" },
    }));
    setCameraOpen(false);
    setCapturedUri(null);
    setCameraField(null);
  };

  const retakePhoto = () => setCapturedUri(null);
  const cancelCamera = () => {
    setCameraOpen(false);
    setCapturedUri(null);
    setCameraField(null);
  };

  const chooseImageSource = (field) => {
    Alert.alert(getFieldLabel(field), "Choose an option", [
      { text: "Choose from gallery", onPress: () => pickFromGallery(field) },
      { text: "Take photo", onPress: () => openCamera(field) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const pickFromGallery = async (field) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Permission required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setFiles((prev) => ({ ...prev, [field]: result.assets[0] }));
    }
  };

  const handleSubmit = async () => {
    if (!missing) return;

    // Client-side check: Tier 2 requires at least one of BVN or NIN
    if (forceTier2 && !values.bvn?.trim() && !values.nin?.trim()) {
      const msg = "Please provide either BVN or NIN.";
      setError(msg);
      Alert.alert("Required", msg);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      for (const field of fieldsToRender) {
        if (fileFields.has(field)) {
          if (files[field]) appendImage(formData, field, files[field]);
        } else if (values[field]?.trim()) {
          formData.append(field, values[field].trim());
        }
      }
      const endpoint = isApproved ? `kyc/upgrade/${targetTier || "2"}/` : "kyc/submit/";
      await axiosClient.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Success", "Submitted successfully.", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to submit.";
      setError(msg);
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (_event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const iso = selectedDate.toISOString().split("T")[0];
      setValues((prev) => ({ ...prev, date_of_birth: iso }));
    }
  };

  if (cameraOpen) {
    const facing = cameraField === "selfie" ? "front" : "back";
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {!capturedUri ? (
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing}>
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
              <TouchableOpacity onPress={cancelCamera} style={{ marginTop: 16 }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        ) : (
          <View style={{ flex: 1 }}>
            <Image source={{ uri: capturedUri }} style={{ flex: 1 }} resizeMode="contain" />
            <View style={styles.previewButtons}>
              <Button mode="outlined" onPress={retakePhoto} textColor="#000" style={{ flex: 1, marginRight: 8, backgroundColor: "#fff" }}>
                Retake
              </Button>
              <Button mode="contained" onPress={acceptPhoto} buttonColor="#2563EB" textColor="#fff" style={{ flex: 1 }}>
                Accept
              </Button>
            </View>
          </View>
        )}
      </View>
    );
  }

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  const hasBvn = backendHasBvn;
  const hasNin = backendHasNin;
  const isFullyVerified = isApproved && (hasBvn || hasNin) && backendHasProofOfAddress;
  const isNewUser = !isApproved;

  const forceTier2 = isApproved && !hasBvn && !hasNin && !backendHasProofOfAddress;
  const forceTier3 = isApproved && (hasBvn || hasNin) && !backendHasProofOfAddress;

  const fieldsToRender = isFullyVerified
    ? []
    : isNewUser
    ? (missing || [])
    : forceTier3
    ? ["proof_of_address"]
    : forceTier2
    ? ["bvn", "nin"]
    : (missing || []);

  const dailyLimit = limits?.daily_send_ngn || limits?.daily_send_limit || "—";
  const perSendLimit = limits?.single_send_ngn || limits?.per_send_limit || "—";

  const isOptionalField = (field) => forceTier2 && (field === "bvn" || field === "nin");

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Get Verified</Text>
      {status ? <Text style={styles.status}>Current status: {status.toUpperCase()}</Text> : null}
      {limits?.tier != null ? (
        <Text style={styles.status}>
          Current tier: {limits.tier} · Daily: ₦{dailyLimit} · Per send: ₦{perSendLimit}
        </Text>
      ) : null}

      {missing === null ? (
        <Button mode="outlined" onPress={() => setRefreshAttempt((a) => a + 1)} textColor="#000">
          Retry
        </Button>
      ) : isFullyVerified ? (
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Text style={styles.message}>Fully verified</Text>
          <Text style={styles.subtitle}>Your account is at the highest tier.</Text>
        </View>
      ) : (
        <>
          <Text style={styles.subtitle}>
            {isNewUser
              ? "Complete Tier 1 verification (basic details)."
              : forceTier3
              ? "Upload proof of address to complete Tier 3."
              : forceTier2
              ? "Provide BVN or NIN (at least one) to complete Tier 2."
              : "Provide the remaining information."}
          </Text>

          {fieldsToRender.map((field) => {
            if (fileFields.has(field)) {
              return (
                <View key={field} style={styles.field}>
                  <RequiredLabel>{getFieldLabel(field)}</RequiredLabel>
                  <Button
                    mode="outlined"
                    onPress={() => chooseImageSource(field)}
                    textColor="#000"
                    style={styles.whiteButton}
                  >
                    {files[field] ? "Captured" : `Upload ${getFieldLabel(field)}`}
                  </Button>
                  {files[field] && <Text style={styles.captured}>✓ Captured</Text>}
                </View>
              );
            }

            if (field === "gender") {
              return (
                <View key={field} style={styles.field}>
                  <RequiredLabel>{getFieldLabel(field)}</RequiredLabel>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={values[field] || ""}
                      onValueChange={(v) => setValues((p) => ({ ...p, [field]: v }))}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select gender" value="" color="#000" />
                      <Picker.Item label="Male" value="male" color="#000" />
                      <Picker.Item label="Female" value="female" color="#000" />
                      <Picker.Item label="Other" value="other" color="#000" />
                    </Picker>
                  </View>
                </View>
              );
            }

            if (field === "state") {
              return (
                <View key={field} style={styles.field}>
                  <RequiredLabel>{getFieldLabel(field)}</RequiredLabel>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={values[field] || ""}
                      onValueChange={(v) => setValues((p) => ({ ...p, [field]: v }))}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select state" value="" color="#000" />
                      {NIGERIAN_STATES.map((st) => (
                        <Picker.Item key={st} label={st} value={st} color="#000" />
                      ))}
                    </Picker>
                  </View>
                </View>
              );
            }

            if (field === "government_id_type") {
              return (
                <View key={field} style={styles.field}>
                  <RequiredLabel>{getFieldLabel(field)}</RequiredLabel>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={values[field] || ""}
                      onValueChange={(v) => setValues((p) => ({ ...p, [field]: v }))}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select ID type" value="" color="#000" />
                      <Picker.Item label="National ID (NIN Slip / Card)" value="national_id" color="#000" />
                      <Picker.Item label="International Passport" value="passport" color="#000" />
                      <Picker.Item label="Driver's Licence" value="drivers_license" color="#000" />
                      <Picker.Item label="Voter's Card (PVC)" value="voters_card" color="#000" />
                    </Picker>
                  </View>
                </View>
              );
            }

            if (field === "date_of_birth") {
              return (
                <View key={field} style={styles.field}>
                  <RequiredLabel>{getFieldLabel(field)}</RequiredLabel>
                  <Button
                    mode="outlined"
                    onPress={() => setShowDatePicker(true)}
                    textColor="#000"
                    style={styles.whiteButton}
                  >
                    {values[field] || "Select date of birth"}
                  </Button>
                  {showDatePicker && (
                    <DateTimePicker
                      value={values[field] ? new Date(values[field]) : new Date(2000, 0, 1)}
                      mode="date"
                      display="default"
                      onChange={onDateChange}
                      maximumDate={new Date()}
                    />
                  )}
                </View>
              );
            }

            return (
              <TextInput
                key={field}
                label={
                  isOptionalField(field) ? (
                    getFieldLabel(field)
                  ) : (
                    <Text>
                      {getFieldLabel(field)}
                      <Text style={{ color: "#DC2626" }}> *</Text>
                    </Text>
                  )
                }
                value={values[field] || ""}
                onChangeText={(v) =>
                  setValues((prev) => ({
                    ...prev,
                    [field]:
                      field === "nin" || field === "bvn" || field === "phone_number"
                        ? v.replace(/\D/g, "")
                        : v,
                  }))
                }
                mode="outlined"
                keyboardType={field === "nin" || field === "bvn" || field === "phone_number" ? "numeric" : "default"}
                maxLength={field === "nin" || field === "bvn" ? 11 : undefined}
                style={styles.field}
                textColor="#000"
                theme={{ colors: { background: "#FFFFFF", primary: "#2563EB" } }}
              />
            );
          })}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submit}
            buttonColor="#2563EB"
            textColor="#FFFFFF"
          >
            {loading ? "Submitting..." : isApproved ? "Upgrade tier" : "Submit Tier 1"}
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
  title: { fontFamily: "serif", fontSize: 26, fontWeight: "700", color: "#0F172A", marginBottom: 12 },
  subtitle: { fontFamily: "serif", color: "#64748B", marginBottom: 16 },
  status: { color: "#475569", marginBottom: 8 },
  message: { color: "#166534", fontSize: 16, fontWeight: "600", marginTop: 12 },
  field: { marginBottom: 16 },
  fieldLabel: { color: "#334155", fontWeight: "600", marginBottom: 8 },
  pickerContainer: { backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  picker: { backgroundColor: "#FFFFFF", color: "#000000" },
  whiteButton: { backgroundColor: "#FFFFFF", borderColor: "#E2E8F0" },
  captured: { color: "#166534", fontWeight: "600", marginTop: 6 },
  submit: { marginTop: 8, borderRadius: 10 },
  cameraControls: { flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: 50 },
  captureButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#fff", borderWidth: 4, borderColor: "#2563EB" },
  cancelText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  previewButtons: { flexDirection: "row", padding: 16, backgroundColor: "#F8FAFC" },
});