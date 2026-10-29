import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosClient from "../axiosClient";
import DocumentScanner from "../components/DocumentScanner";

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

function getFieldLabel(field) {
  return fieldLabels[field] || field.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getTargetTier(data) {
  const tier = data.target_tier ?? data.next_tier ?? data.ts;
  return tier === "" || tier == null ? null : String(tier);
}

function getErrorMessage(error, fallback) {
  return error.response?.data?.error || error.response?.data?.detail || error.message || fallback;
}

export default function KYC() {
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState(null);
  const [missing, setMissing] = useState(null);
  const [targetTier, setTargetTier] = useState(null);
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [scanningGovernmentId, setScanningGovernmentId] = useState(false);
  const [scanningSelfie, setScanningSelfie] = useState(false);
  const [error, setError] = useState("");
  const [refreshAttempt, setRefreshAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchKYC = async () => {
      setFetching(true);
      setError("");
      try {
        const { data } = await axiosClient.get("/kyc/");
        if (!Array.isArray(data.missing) || data.missing.some((field) => typeof field !== "string")) {
          throw new Error("KYC status response did not include a valid missing requirements list.");
        }
        if (!active) return;
        setKycStatus(data);
        setMissing(data.missing);
        setTargetTier(getTargetTier(data));
      } catch (fetchError) {
        if (active) {
          setMissing(null);
          setError(getErrorMessage(fetchError, "Could not load your KYC status. Please try again."));
        }
      } finally {
        if (active) setFetching(false);
      }
    };

    fetchKYC();
    return () => {
      active = false;
    };
  }, [refreshAttempt]);

  const handleChange = (field, event) => {
    const value = fileFields.has(field) ? event.target.files?.[0] : event.target.value;
    if (fileFields.has(field)) setFiles((current) => ({ ...current, [field]: value }));
    else setValues((current) => ({ ...current, [field]: value }));
  };

  const handleDocumentCapture = (blob) => {
    setScanningGovernmentId(false);
    if (!blob) {
      toast.error("Could not capture the document. Please try again.");
      return;
    }

    setFiles((current) => ({
      ...current,
      government_id: new File([blob], "id-document.jpg", {
        type: blob.type || "image/jpeg",
      }),
    }));
    toast.success("Document captured");
  };

  const handleSelfieCapture = (blob) => {
    setScanningSelfie(false);
    if (!blob) {
      toast.error("Could not capture the selfie. Please try again.");
      return;
    }

    setFiles((current) => ({
      ...current,
      selfie: new File([blob], "selfie.jpg", {
        type: blob.type || "image/jpeg",
      }),
    }));
    toast.success("Selfie captured");
  };

  const handleUpgrade = async (event) => {
    event.preventDefault();
    if (!missing?.length) return;
    if (!targetTier) {
      setError("Your KYC status did not include a target tier. Please refresh your status or contact support.");
      return;
    }

    const incomplete = missing.filter((field) => {
      if (fileFields.has(field)) {
        return !files[field] || files[field].size === 0;
      }
      return !values[field]?.trim();
    });
    if (incomplete.length > 0) {
      setError(`Complete all requested fields: ${incomplete.map(getFieldLabel).join(", ")}.`);
      return;
    }

    setLoading(true);
    setError("");
    const upgradeFormData = new FormData();
    missing.forEach((field) => {
      if (fileFields.has(field)) {
        if (files[field]) {
          upgradeFormData.append(field, files[field]);
        }
      } else if (values[field]) {
        upgradeFormData.append(field, values[field].trim());
      }
    });
    console.debug("KYC fields ready to submit:", Array.from(upgradeFormData.keys()));

    try {
      const isApproved = ["approved", "verified"].includes(
        String(kycStatus?.status || "").toLowerCase(),
      );
      await axiosClient.post(
        isApproved
          ? `/kyc/upgrade/${encodeURIComponent(targetTier)}/`
          : "/kyc/submit/",
        upgradeFormData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      toast.success(
        isApproved
          ? "KYC documents updated"
          : "KYC submitted — awaiting approval",
      );
      setTimeout(() => navigate("/dashboard", { replace: true }), 1800);
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Failed to upgrade your tier. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={styles.page}>
        <p style={styles.message}>Loading your KYC status...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Verify your identity</h1>
        {kycStatus?.status && (
          <p style={styles.status}>Current status: {kycStatus.status.toUpperCase()}</p>
        )}
        {kycStatus?.limits?.tier != null && (
          <p style={styles.status}>Current tier: {kycStatus.limits.tier}</p>
        )}

        {missing === null ? (
          <button type="button" style={styles.secondaryButton} onClick={() => setRefreshAttempt((attempt) => attempt + 1)}>
            Retry
          </button>
        ) : missing.length === 0 ? (
          <p style={styles.success}>You are at the highest tier.</p>
        ) : (
          <form onSubmit={handleUpgrade}>
            <p style={styles.subtitle}>Provide only the remaining information requested for your account.</p>
            {!targetTier && (
              <p role="alert" style={styles.error}>
                Your KYC status did not include a target tier. Please refresh your status or contact support.
              </p>
            )}
            {missing.map((field) => (
              <div key={field} style={styles.field}>
                <label htmlFor={`kyc-${field}`} style={styles.label}>
                  {getFieldLabel(field)}
                </label>
                {fileFields.has(field) ? (
                  <>
                    <input
                      id={`kyc-${field}`}
                      name={field}
                      type="file"
                      accept={field === "selfie" ? "image/*" : "image/*,.pdf"}
                      onChange={(event) => handleChange(field, event)}
                      style={styles.input}
                    />
                    {files[field] && (
                      <p style={styles.captured}>
                        ✓ {field === "selfie" ? "Selfie" : "Document"} captured
                      </p>
                    )}
                    {field === "government_id" && (
                      <>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => setScanningGovernmentId(true)}
                          style={styles.secondaryButton}
                        >
                          {files.government_id ? "Retake" : "Scan document"}
                        </button>
                        {scanningGovernmentId && (
                          <DocumentScanner
                            onCapture={handleDocumentCapture}
                            onCancel={() => setScanningGovernmentId(false)}
                          />
                        )}
                      </>
                    )}
                    {field === "selfie" && (
                      <>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => setScanningSelfie(true)}
                          style={styles.secondaryButton}
                        >
                          {files.selfie ? "Retake" : "Take selfie"}
                        </button>
                        {scanningSelfie && (
                          <DocumentScanner
                            facingMode="user"
                            onCapture={handleSelfieCapture}
                            onCancel={() => setScanningSelfie(false)}
                          />
                        )}
                      </>
                    )}
                  </>
                ) : (
                  field === "gender" ? (
                    <select
                      id={`kyc-${field}`}
                      name={field}
                      value={values[field] || ""}
                      onChange={(event) => handleChange(field, event)}
                      style={styles.input}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : field === "government_id_type" ? (
                    <select
                      id={`kyc-${field}`}
                      name={field}
                      value={values[field] || ""}
                      onChange={(event) => handleChange(field, event)}
                      style={styles.input}
                    >
                      <option value="">Select ID type</option>
                      <option value="national_id">National ID (NIN Slip / Card)</option>
                      <option value="passport">International Passport</option>
                      <option value="drivers_license">Driver&apos;s Licence</option>
                      <option value="voters_card">Voter&apos;s Card (PVC)</option>
                    </select>
                  ) : (
                    <input
                      id={`kyc-${field}`}
                      name={field}
                      type={field === "date_of_birth" ? "date" : "text"}
                      inputMode={field === "nin" || field === "bvn" ? "numeric" : undefined}
                      maxLength={field === "nin" || field === "bvn" ? 11 : undefined}
                      value={values[field] || ""}
                      onChange={(event) => handleChange(field, event)}
                      style={styles.input}
                    />
                  )
                )}
              </div>
            ))}
            <button type="submit" disabled={loading || !targetTier} style={styles.submitButton}>
              {loading ? "Submitting..." : "Upgrade tier"}
            </button>
          </form>
        )}
        {error && <p role="alert" style={styles.error}>{error}</p>}
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100%",
    padding: "32px 20px",
    background: "#f8fafc",
  },
  card: {
    width: "100%",
    maxWidth: 640,
    margin: "0 auto",
    padding: 24,
    borderRadius: 16,
    background: "#fff",
    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.08)",
  },
  title: { margin: "0 0 16px", color: "#0f172a" },
  subtitle: { marginBottom: 20, color: "#64748b" },
  status: { margin: "4px 0", color: "#475569" },
  message: { color: "#475569", textAlign: "center" },
  success: { marginTop: 20, color: "#166534", fontWeight: 600 },
  captured: {
    margin: "8px 0 0",
    color: "#166534",
    fontWeight: 600,
    fontSize: 14,
  },
  field: { display: "flex", flexDirection: "column", gap: 8, marginTop: 16 },
  label: { color: "#334155", fontWeight: 600 },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    fontSize: 15,
  },
  submitButton: {
    width: "100%",
    marginTop: 24,
    padding: 13,
    border: 0,
    borderRadius: 8,
    background: "#0f172a",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryButton: {
    marginTop: 16,
    padding: "10px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    background: "#fff",
    color: "#0f172a",
    cursor: "pointer",
  },
  error: { marginTop: 16, color: "#b91c1c" },
};
