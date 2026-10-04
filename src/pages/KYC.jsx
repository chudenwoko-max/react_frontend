import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

const steps = [
  { id: 1, title: "Personal" },
  { id: 2, title: "Identity" },
  { id: 3, title: "Address" },
  { id: 4, title: "Documents" },
  { id: 5, title: "Review" },
];

function Required() {
  return <span style={{ color: "#dc2626" }}> *</span>;
}

function maskId(value) {
  const raw = String(value || "");
  if (raw.length < 4) return raw ? "Provided" : "Not provided";
  return "•••••••" + raw.slice(-4);
}

export default function KYC() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);

  const [formData, setFormData] = useState({
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
    government_id: null,
    proof_of_address: null,
    selfie: null,
  });

  useEffect(() => {
    const fetchKYC = async () => {
      try {
        const res = await axiosClient.get("/kyc/");
        setKycStatus(res.data);
        setFormData((prev) => ({
          ...prev,
          ...res.data,
          government_id: null,
          proof_of_address: null,
          selfie: null,
        }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchKYC();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.full_name.trim()) return "Full legal name is required";
      if (!formData.date_of_birth) return "Date of birth is required";
      if (!formData.phone_number || formData.phone_number.length < 10) {
        return "A valid phone number is required";
      }
    }
    if (currentStep === 2) {
      const bvn = (formData.bvn || "").trim();
      const nin = (formData.nin || "").trim();
      if (!bvn && !nin) return "Enter BVN or NIN";
      if (bvn && bvn.length !== 11) return "BVN must be 11 digits";
      if (nin && nin.length !== 11) return "NIN must be 11 digits";
    }
    if (currentStep === 3) {
      if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim()) {
        return "Street, city, and state are required";
      }
    }
    if (currentStep === 4) {
      if (!formData.government_id_type) return "Select a government ID type";
      if (!formData.government_id) return "Upload a government-issued ID";
      if (!formData.selfie) return "Upload a selfie";
    }
    return "";
  };

  const nextStep = () => {
    const error = validateStep();
    if (error) {
      toast.error(error);
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    const error = validateStep();
    if (error) {
      toast.error(error);
      return;
    }
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        data.append(key, formData[key]);
      }
    });

    try {
      const res = await axiosClient.post("/kyc/submit/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("KYC submitted successfully");
      setKycStatus(res.data.data || { status: "pending" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit KYC");
    } finally {
      setLoading(false);
    }
  };

  if (kycStatus?.status === "approved") {
    return (
      <div style={styles.page}>
        <div style={styles.statusCard}>
          <h2 style={{ color: "#16a34a", marginBottom: 8 }}>Identity verified</h2>
          <p style={{ color: "#6b7280" }}>
            Your account is verified (Tier {kycStatus.tier || "1"}).
          </p>
        </div>
      </div>
    );
  }

  if (kycStatus?.status === "pending") {
    return (
      <div style={styles.page}>
        <div style={styles.statusCard}>
          <h2 style={{ color: "#d97706", marginBottom: 8 }}>Under review</h2>
          <p style={{ color: "#6b7280" }}>
            Documents are received. Review is manual until a verification bureau is connected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Verify your identity</h1>
        <p style={styles.subtitle}>
          Required fields are marked with an asterisk. This raises your limits. It does not open a bank account.
        </p>
      </div>

      <div style={styles.stepper}>
        {steps.map((step, index) => (
          <div key={step.id} style={styles.stepItem}>
            <div
              style={{
                ...styles.stepCircle,
                background: currentStep >= step.id ? "#2563eb" : "#e5e7eb",
                color: currentStep >= step.id ? "white" : "#6b7280",
              }}
            >
              {step.id}
            </div>
            <span
              style={{
                fontSize: 13,
                marginTop: 6,
                color: currentStep >= step.id ? "#2563eb" : "#9ca3af",
                fontWeight: currentStep === step.id ? 600 : 400,
              }}
            >
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div
                style={{
                  ...styles.stepLine,
                  background: currentStep > step.id ? "#2563eb" : "#e5e7eb",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div style={styles.card}>
        {currentStep === 1 && (
          <div>
            <h2 style={styles.sectionTitle}>Personal information</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full legal name<Required /></label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name || ""}
                onChange={handleChange}
                style={styles.input}
                placeholder="Name as it appears on your ID"
                required
              />
            </div>
            <div style={styles.row}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Date of birth<Required /></label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth || ""}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone number<Required /></label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number || ""}
                onChange={handleChange}
                style={styles.input}
                placeholder="0801 234 5678"
                required
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 style={styles.sectionTitle}>Identity numbers</h2>
            <p style={{ color: "#6b7280", marginBottom: 24, fontSize: 14 }}>
              BVN or NIN is required. Providing both is optional.
            </p>
            <div style={styles.formGroup}>
              <label style={styles.label}>Bank Verification Number (BVN)</label>
              <input
                type="text"
                name="bvn"
                maxLength={11}
                inputMode="numeric"
                value={formData.bvn || ""}
                onChange={handleChange}
                style={styles.input}
                placeholder="11-digit BVN"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>National Identification Number (NIN)</label>
              <input
                type="text"
                name="nin"
                maxLength={11}
                inputMode="numeric"
                value={formData.nin || ""}
                onChange={handleChange}
                style={styles.input}
                placeholder="11-digit NIN"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 style={styles.sectionTitle}>Residential address</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Street address<Required /></label>
              <textarea
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                style={{ ...styles.input, height: 90, resize: "none" }}
                placeholder="House number, street name"
                required
              />
            </div>
            <div style={styles.row}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>City<Required /></label>
                <input type="text" name="city" value={formData.city || ""} onChange={handleChange} style={styles.input} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>State<Required /></label>
                <input type="text" name="state" value={formData.state || ""} onChange={handleChange} style={styles.input} required />
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h2 style={styles.sectionTitle}>Upload documents</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Government ID type<Required /></label>
              <select
                name="government_id_type"
                value={formData.government_id_type || ""}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="">Select document type</option>
                <option value="national_id">National ID card</option>
                <option value="passport">International passport</option>
                <option value="drivers_license">Driver’s licence</option>
                <option value="voters_card">Voter’s card</option>
              </select>
            </div>
            <div style={styles.uploadBox}>
              <label style={styles.label}>Government-issued ID<Required /></label>
              <input type="file" name="government_id" accept="image/*,.pdf" onChange={handleChange} required />
              <p style={styles.helper}>Colour photo or PDF of the original ID. Required.</p>
            </div>
            <div style={styles.uploadBox}>
              <label style={styles.label}>Selfie<Required /></label>
              <input type="file" name="selfie" accept="image/*" onChange={handleChange} required />
              <p style={styles.helper}>Face clearly visible, no sunglasses.</p>
            </div>
            <div style={styles.uploadBox}>
              <label style={styles.label}>Proof of address</label>
              <input type="file" name="proof_of_address" accept="image/*,.pdf" onChange={handleChange} />
              <p style={styles.helper}>Optional. Utility bill or bank statement from the last 3 months.</p>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div>
            <h2 style={styles.sectionTitle}>Review</h2>
            <div style={styles.reviewBox}>
              <p><strong>Full name:</strong> {formData.full_name || "—"}</p>
              <p><strong>Phone:</strong> {formData.phone_number || "—"}</p>
              <p><strong>BVN:</strong> {maskId(formData.bvn)}</p>
              <p><strong>NIN:</strong> {maskId(formData.nin)}</p>
              <p><strong>Government ID:</strong> {formData.government_id_type || "Missing"} {formData.government_id ? "(file attached)" : "(file missing)"}</p>
              <p><strong>Address:</strong> {formData.address}, {formData.city}, {formData.state}</p>
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", marginTop: 16 }}>
              You confirm this information is accurate. Payhost stores it for review and does not verify BVN or NIN with a bureau yet.
            </p>
          </div>
        )}

        <div style={styles.footer}>
          {currentStep > 1 ? (
            <button onClick={prevStep} style={styles.secondaryBtn}>Back</button>
          ) : (
            <div />
          )}
          {currentStep < 5 ? (
            <button onClick={nextStep} style={styles.primaryBtn}>Continue</button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ ...styles.primaryBtn, background: loading ? "#93c5fd" : "#16a34a" }}
            >
              {loading ? "Submitting..." : "Submit verification"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 720, margin: "0 auto", padding: "40px 20px" },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 700, color: "#111827", marginBottom: 8 },
  subtitle: { color: "#6b7280", fontSize: 15 },
  stepper: { display: "flex", justifyContent: "space-between", marginBottom: 40, position: "relative" },
  stepItem: { display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" },
  stepCircle: {
    width: 36, height: 36, borderRadius: "50%", display: "flex",
    alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14, zIndex: 2,
  },
  stepLine: { position: "absolute", top: 18, left: "50%", width: "100%", height: 2, zIndex: 1 },
  card: {
    background: "#ffffff", borderRadius: 16, padding: "32px 36px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6",
  },
  sectionTitle: { fontSize: 20, fontWeight: 600, marginBottom: 24, color: "#111827" },
  formGroup: { marginBottom: 20 },
  label: { display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 6 },
  input: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #d1d5db", fontSize: 15, outline: "none" },
  row: { display: "flex", gap: 16, marginBottom: 20 },
  uploadBox: { marginBottom: 20, padding: 16, border: "1px dashed #d1d5db", borderRadius: 10, background: "#f9fafb" },
  helper: { fontSize: 12, color: "#9ca3af", marginTop: 6 },
  reviewBox: { background: "#f9fafb", borderRadius: 12, padding: 20, fontSize: 14, lineHeight: 1.8 },
  footer: { display: "flex", justifyContent: "space-between", marginTop: 36, paddingTop: 24, borderTop: "1px solid #f3f4f6" },
  primaryBtn: {
    background: "#2563eb", color: "white", border: "none", padding: "12px 28px",
    borderRadius: 10, fontWeight: 600, fontSize: 15, cursor: "pointer",
  },
  secondaryBtn: {
    background: "white", color: "#374151", border: "1px solid #d1d5db",
    padding: "12px 28px", borderRadius: 10, fontWeight: 500, fontSize: 15, cursor: "pointer",
  },
  statusCard: {
    background: "white", borderRadius: 16, padding: "60px 40px", textAlign: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)", marginTop: 60,
  },
};