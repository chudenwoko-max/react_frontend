import { useAuth } from "../src/context/AuthContext";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { router } from "expo-router";
import axiosClient from "../src/api/axiosClient";

const STEPS = ["Personal", "Identity", "Address", "Documents", "Review"];

function maskId(value: string) {
  const raw = String(value || "");
  if (raw.length < 4) return raw ? "Provided" : "Not provided";
  return `•••••••${raw.slice(-4)}`;
}

function pickFile(accept: string): Promise<File | null> {
  if (Platform.OS !== "web") {
    Alert.alert("Phone build", "Document upload is available on Expo web for now.");
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => resolve(input.files?.[0] || null);
    input.click();
  });
}

export default function KycScreen() {
  const { logout } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [tier, setTier] = useState("1");
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    phone_number: "",
    bvn: "",
    nin: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    government_id_type: "",
    government_id: null as File | null,
    proof_of_address: null as File | null,
    selfie: null as File | null,
  });

  useEffect(() => {
    axiosClient
      .get("kyc/")
      .then((res) => {
        setStatus(res.data.status || res.data.kyc_status || null);
        setTier(String(res.data.tier || "1"));
        setRejectionReason(res.data.rejection_reason || "");
        setForm((prev) => ({
          ...prev,
          ...res.data,
          government_id: null,
          proof_of_address: null,
          selfie: null,
        }));
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    if (step === 0) {
      if (!form.full_name.trim()) return "Full legal name is required";
      if (!form.date_of_birth) return "Date of birth is required";
      if (!form.phone_number || form.phone_number.length < 10) return "A valid phone number is required";
    }
    if (step === 1) {
      const bvn = form.bvn.trim();
      const nin = form.nin.trim();
      if (!bvn && !nin) return "Enter BVN or NIN";
      if (bvn && bvn.length !== 11) return "BVN must be 11 digits";
      if (nin && nin.length !== 11) return "NIN must be 11 digits";
    }
    if (step === 2) {
      if (!form.address.trim() || !form.city.trim() || !form.state.trim()) {
        return "Street, city, and state are required";
      }
    }
    if (step === 3) {
      if (!form.government_id_type) return "Select a government ID type";
      if (!form.government_id) return "Upload a government-issued ID";
      if (!form.selfie) return "Upload a selfie";
    }
    return "";
  };

  const next = () => {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep((n) => Math.min(n + 1, 4));
  };

  const submit = async () => {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setLoading(true);
    setError("");
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) data.append(key, value as string | Blob);
    });
    try {
      // CHANGE: same fields as the website wizard. Path has no extra /api/.
      await axiosClient.post("kyc/submit/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("pending");
    } catch (err: any) {
      if (err?.response?.status === 401) {
        await logout();
        router.replace("/(auth)/login");
        return;
      }
      setError(err.response?.data?.error || err.response?.data?.detail || "Failed to submit KYC");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.center}>
        <Text>Loading verification</Text>
      </View>
    );
  }

  if (status === "approved") {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Identity verified</Text>
        <Text style={styles.subtitle}>Your account is verified (Tier {tier}).</Text>
      </View>
    );
  }

  if (status === "pending") {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Under review</Text>
        <Text style={styles.subtitle}>
          Documents are received. Review is manual until a verification bureau is connected.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Verify your identity</Text>
      <Text style={styles.subtitle}>
        Step {step + 1} of 5 · {STEPS[step]}. This raises your limits. It does not open a bank account.
      </Text>
      {status === "rejected" && rejectionReason ? (
        <Text style={styles.rejected}>{rejectionReason}</Text>
      ) : null}

      {step === 0 && (
        <>
          <TextInput label="Full legal name *" value={form.full_name} onChangeText={(v) => set("full_name", v)} mode="outlined" style={styles.input} />
          <TextInput label="Date of birth * (YYYY-MM-DD)" value={form.date_of_birth} onChangeText={(v) => set("date_of_birth", v)} mode="outlined" style={styles.input} />
          <TextInput label="Gender" value={form.gender} onChangeText={(v) => set("gender", v)} mode="outlined" style={styles.input} placeholder="Male or Female" />
          <TextInput label="Phone number *" value={form.phone_number} onChangeText={(v) => set("phone_number", v)} mode="outlined" keyboardType="phone-pad" style={styles.input} />
        </>
      )}

      {step === 1 && (
        <>
          <Text style={styles.subtitle}>BVN or NIN is required. Providing both is optional.</Text>
          <TextInput label="BVN" value={form.bvn} onChangeText={(v) => set("bvn", v)} mode="outlined" keyboardType="numeric" maxLength={11} style={styles.input} />
          <TextInput label="NIN" value={form.nin} onChangeText={(v) => set("nin", v)} mode="outlined" keyboardType="numeric" maxLength={11} style={styles.input} />
        </>
      )}

      {step === 2 && (
        <>
          <TextInput label="Street address *" value={form.address} onChangeText={(v) => set("address", v)} mode="outlined" style={styles.input} />
          <TextInput label="City *" value={form.city} onChangeText={(v) => set("city", v)} mode="outlined" style={styles.input} />
          <TextInput label="State *" value={form.state} onChangeText={(v) => set("state", v)} mode="outlined" style={styles.input} />
        </>
      )}

      {step === 3 && (
        <>
          <TextInput label="Government ID type *" value={form.government_id_type} onChangeText={(v) => set("government_id_type", v)} mode="outlined" style={styles.input} placeholder="national_id, passport, drivers_license, voters_card" />
          <TouchableOpacity style={styles.upload} onPress={async () => {
            const governmentId = await pickFile("image/*,.pdf");
            setForm((p) => ({ ...p, government_id: governmentId }));
          }}>
            <Text>{form.government_id ? form.government_id.name : "Upload government-issued ID *"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.upload} onPress={async () => {
            const selfie = await pickFile("image/*");
            setForm((p) => ({ ...p, selfie }));
          }}>
            <Text>{form.selfie ? form.selfie.name : "Upload selfie *"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.upload} onPress={async () => {
            const proofOfAddress = await pickFile("image/*,.pdf");
            setForm((p) => ({ ...p, proof_of_address: proofOfAddress }));
          }}>
            <Text>{form.proof_of_address ? form.proof_of_address.name : "Upload proof of address (optional)"}</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 4 && (
        <View style={styles.review}>
          <Text>Full name: {form.full_name || "—"}</Text>
          <Text>Phone: {form.phone_number || "—"}</Text>
          <Text>BVN: {maskId(form.bvn)}</Text>
          <Text>NIN: {maskId(form.nin)}</Text>
          <Text>Government ID: {form.government_id_type || "Missing"} {form.government_id ? "(file attached)" : "(file missing)"}</Text>
          <Text>Address: {form.address}, {form.city}, {form.state}</Text>
          <Text style={styles.subtitle}>
            Payhost stores this for review and does not verify BVN or NIN with a bureau yet.
          </Text>
        </View>
      )}

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <View style={styles.row}>
        {step > 0 ? (
          <Button mode="outlined" onPress={() => setStep((n) => n - 1)} style={styles.button}>Back</Button>
        ) : (
          <View />
        )}
        {step < 4 ? (
          <Button mode="contained" onPress={next} style={styles.button}>Continue</Button>
        ) : (
          <Button mode="contained" onPress={submit} loading={loading} disabled={loading} style={styles.button}>
            Submit verification
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  inner: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#F8FAFC" },
  title: { fontSize: 26, fontWeight: "700", color: "#0F172A", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#64748B", marginBottom: 16 },
  rejected: { color: "#B91C1C", marginBottom: 16 },
  input: { marginBottom: 14 },
  upload: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, padding: 14, marginBottom: 12 },
  review: { backgroundColor: "#F1F5F9", borderRadius: 12, padding: 16, gap: 6, marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  button: { borderRadius: 10 },
});