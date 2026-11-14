import { useEffect, useRef, useState } from "react";
import axiosClient from "../axiosClient";
import { useNavigate } from "react-router-dom";

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

function getTargetTier(data) {
  const tier = data.target_tier ?? data.next_tier ?? data.ts;
  return tier === "" || tier == null ? null : String(tier);
}

function isFieldRequired(field, { isNewUser, forceTier2, forceTier3 }) {
  if (isNewUser) {
    return [
      "full_name", "date_of_birth", "gender", "phone_number",
      "address", "city", "state", "country",
    ].includes(field);
  }
  if (forceTier2) return ["bvn", "nin"].includes(field);
  if (forceTier3) return ["proof_of_address"].includes(field);
  return true;
}

function RequiredLabel({ field, required, children }) {
  return (
    <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
      {children || getFieldLabel(field)}
      {required && <span style={{ color: "#B91C1C" }}> *</span>}
    </label>
  );
}
function SelfieCamera({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null); // { file, url }
  const [hint, setHint] = useState("Position your face in the oval");

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startCamera = async () => {
    setError("");
    setHint("Position your face in the oval");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError("Camera access denied or unavailable. Please allow camera permission.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
      if (preview?.url) URL.revokeObjectURL(preview.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) {
        setError("Could not capture photo.");
        return;
      }
      const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      setPreview({ file, url });
      setHint("");
      stopStream();
    }, "image/jpeg", 0.92);
  };

  const retake = async () => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
    await startCamera();
  };

  const accept = () => {
    if (preview?.file) onCapture(preview.file);
    onClose();
  };

  return (
    <div style={camStyles.overlay}>
      <div style={camStyles.modal}>
        <div style={camStyles.topBar}>
          <span style={{ fontWeight: 600 }}>Take a selfie</span>
          <button type="button" onClick={onClose} style={camStyles.closeBtn} aria-label="Close">
            ✕
          </button>
        </div>

        <div style={camStyles.previewWrap}>
          {preview ? (
            <img src={preview.url} alt="Snapped selfie" style={camStyles.previewImg} />
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted style={camStyles.video} />
              <div style={camStyles.faceGuide} />
            </>
          )}
        </div>

        {hint ? <p style={camStyles.hint}>{hint}</p> : null}
        {error && <p style={camStyles.error}>{error}</p>}

        <div style={camStyles.bottomBar}>
          {preview ? (
            <>
              <button type="button" onClick={retake} style={camStyles.secondaryBtn}>
                Retake
              </button>
              <button type="button" onClick={accept} style={camStyles.primaryBtn}>
                Accept
              </button>
            </>
          ) : (
            <button type="button" onClick={takePhoto} style={camStyles.shutter} aria-label="Take photo" />
          )}
        </div>
      </div>
    </div>
  );
}

const camStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.72)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    background: "#0f172a",
    color: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 420,
    padding: "16px 16px 20px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 20,
    cursor: "pointer",
  },
  previewWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "3 / 4",
    borderRadius: 16,
    overflow: "hidden",
    background: "#1e293b",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: "scaleX(-1)",
  },
  faceGuide: {
    position: "absolute",
    inset: "14% 20%",
    border: "4px solid rgba(255,255,255,0.9)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  bottomBar: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginTop: 16,
  },
  shutter: {
    width: 68,
    height: 68,
    borderRadius: "50%",
    border: "4px solid #fff",
    background: "#3b82f6",
    cursor: "pointer",
  },
  hint: {
    textAlign: "center",
    fontSize: 13,
    color: "#94a3b8",
    margin: "10px 0 0",
  },
  error: {
    color: "#fca5a5",
    fontSize: 13,
    textAlign: "center",
    margin: "8px 0 0",
  },
};

export default function KYC() {
  const [status, setStatus] = useState("");
  const [missing, setMissing] = useState(null);
  const [targetTier, setTargetTier] = useState(null);
  const [limits, setLimits] = useState(null);
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [backendHasBvn, setBackendHasBvn] = useState(false);
  const [backendHasNin, setBackendHasNin] = useState(false);
  const [backendHasProofOfAddress, setBackendHasProofOfAddress] = useState(false);
  const [showSelfieCam, setShowSelfieCam] = useState(false);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [selfieAccepted, setSelfieAccepted] = useState(false);
  const selfiePreviewUrlRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => () => {
    if (selfiePreviewUrlRef.current) URL.revokeObjectURL(selfiePreviewUrlRef.current);
  }, []);

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
        if (active) setError(err.response?.data?.error || err.message || "Could not load KYC status.");
      } finally {
        if (active) setFetching(false);
      }
    };
    fetchStatus();
    return () => { active = false; };
  }, []);

  const handleFile = (field, file) => {
    if (!file) return;
    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  const handleSelfieCapture = (file) => {
    if (selfiePreview?.url) URL.revokeObjectURL(selfiePreview.url);
    const url = URL.createObjectURL(file);
    selfiePreviewUrlRef.current = url;
    setSelfiePreview({ file, url });
    setSelfieAccepted(false);
    setFiles((prev) => ({ ...prev, selfie: file }));
  };

  const isNewUser = !isApproved;
  const hasBvn = backendHasBvn;
  const hasNin = backendHasNin;
  const isFullyVerified = isApproved && hasBvn && hasNin && backendHasProofOfAddress;
  const forceTier2 = isApproved && (!hasBvn || !hasNin) && !isFullyVerified;
  const forceTier3 = isApproved && hasBvn && hasNin && !backendHasProofOfAddress && !isFullyVerified;

  const fieldsToRender = isFullyVerified
    ? []
    : isNewUser
    ? (missing || [])
    : forceTier3
    ? ["proof_of_address"]
    : forceTier2
    ? ["bvn", "nin"]
    : (missing || []);

  const handleSubmit = async () => {
    if (!missing) return;
    setLoading(true);
    setError("");

  

    const ctx = { isNewUser, forceTier2, forceTier3 };
    const requiredMissing = fieldsToRender.filter((field) => {
      if (!isFieldRequired(field, ctx)) return false;
      if (fileFields.has(field)) return !files[field];
      return !values[field]?.trim();
    });

    if (requiredMissing.length) {
      const names = requiredMissing.map(getFieldLabel).join(", ");
      const msg = `Please complete: ${names}`;
      setError(msg);
      alert(msg);
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      for (const field of fieldsToRender) {
        if (fileFields.has(field)) {
          if (files[field]) formData.append(field, files[field]);
        } else if (values[field]?.trim()) {
          formData.append(field, values[field].trim());
        }
      }
      const endpoint = isApproved ? `kyc/upgrade/${targetTier || "2"}/` : "kyc/submit/";
      await axiosClient.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Submitted successfully.");
navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to submit.";
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading KYC status…</div>;
  }

  const dailyLimit = limits?.daily_send_ngn || limits?.daily_send_limit || "—";
  const perSendLimit = limits?.single_send_ngn || limits?.per_send_limit || "—";
  const ctx = { isNewUser, forceTier2, forceTier3 };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontFamily: "serif", fontSize: 26, marginBottom: 12 }}>Get Verified</h1>
      {status && <p style={{ color: "#475569" }}>Current status: {status.toUpperCase()}</p>}
      {limits?.tier != null && (
        <p style={{ color: "#475569" }}>
          Current tier: {limits.tier} · Daily: ₦{dailyLimit} · Per send: ₦{perSendLimit}
        </p>
      )}

      {missing === null ? (
        <button onClick={() => window.location.reload()}>Retry</button>
      ) : isFullyVerified ? (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <p style={{ color: "#166534", fontWeight: 600 }}>Fully verified</p>
          <p style={{ color: "#64748B" }}>Your account is at the highest tier.</p>
        </div>
      ) : (
        <>
          <p style={{ color: "#64748B", marginBottom: 16 }}>
            {isNewUser
              ? "Complete Tier 1 verification (basic details)."
              : forceTier3
              ? "Upload proof of address to complete Tier 3."
              : forceTier2
              ? "Provide both BVN and NIN to complete Tier 2 (CBN requirement)."
              : "Provide the remaining information."}
          </p>

          {fieldsToRender.map((field) => {
            const required = isFieldRequired(field, ctx);

            if (field === "selfie") {
  return (
    <div key={field} style={{ marginBottom: 16 }}>
      <RequiredLabel field={field} required={required} />
      <button
        type="button"
        onClick={() => setShowSelfieCam(true)}
        style={{
          padding: "12px 18px",
          background: "#1e40af",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {files.selfie ? "Retake selfie" : "Take selfie"}
      </button>
      {files.selfie && (
        <span style={{ color: "#166534", marginLeft: 10 }}>✓ Selfie accepted</span>
      )}
    </div>
  );
}
            if (fileFields.has(field)) {
              return (
                <div key={field} style={{ marginBottom: 16 }}>
                  <RequiredLabel field={field} required={required} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFile(field, e.target.files[0])}
                  />
                  {files[field] && <span style={{ color: "#166534", marginLeft: 8 }}>✓ Selected</span>}
                </div>
              );
            }
            if (field === "gender") {
              return (
                <div key={field} style={{ marginBottom: 16 }}>
                  <RequiredLabel field={field} required={required}>Gender</RequiredLabel>
                  <select
                    value={values[field] || ""}
                    onChange={(e) => setValues({ ...values, [field]: e.target.value })}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0" }}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              );
            }
            if (field === "state") {
              return (
                <div key={field} style={{ marginBottom: 16 }}>
                  <RequiredLabel field={field} required={required}>State</RequiredLabel>
                  <select
                    value={values[field] || ""}
                    onChange={(e) => setValues({ ...values, [field]: e.target.value })}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0" }}
                  >
                    <option value="">Select state</option>
                    {NIGERIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              );
            }
            if (field === "government_id_type") {
              return (
                <div key={field} style={{ marginBottom: 16 }}>
                  <RequiredLabel field={field} required={required}>Government ID type</RequiredLabel>
                  <select
                    value={values[field] || ""}
                    onChange={(e) => setValues({ ...values, [field]: e.target.value })}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0" }}
                  >
                    <option value="">Select ID type</option>
                    <option value="national_id">National ID (NIN Slip / Card)</option>
                    <option value="passport">International Passport</option>
                    <option value="drivers_license">Driver's Licence</option>
                    <option value="voters_card">Voter's Card (PVC)</option>
                  </select>
                </div>
              );
            }
            if (field === "date_of_birth") {
              return (
                <div key={field} style={{ marginBottom: 16 }}>
                  <RequiredLabel field={field} required={required}>Date of birth</RequiredLabel>
                  <input
                    type="date"
                    value={values[field] || ""}
                    onChange={(e) => setValues({ ...values, [field]: e.target.value })}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0" }}
                  />
                </div>
              );
            }
            return (
              <div key={field} style={{ marginBottom: 16 }}>
                <RequiredLabel field={field} required={required} />
                <input
                  type={field === "nin" || field === "bvn" || field === "phone_number" ? "tel" : "text"}
                  value={values[field] || ""}
                  onChange={(e) => {
                    let v = e.target.value;
                    if (field === "nin" || field === "bvn" || field === "phone_number") {
                      v = v.replace(/\D/g, "");
                    }
                    setValues({ ...values, [field]: v });
                  }}
                  maxLength={field === "nin" || field === "bvn" ? 11 : undefined}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0" }}
                />
              </div>
            );
          })}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              marginTop: 8,
              padding: "12px 20px",
              background: "#2563EB",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {loading ? "Submitting..." : isApproved ? "Upgrade tier" : "Submit Tier 1"}
          </button>

          <p style={{ textAlign: "center", color: "#64748B", fontSize: 13, marginTop: 16 }}>
            🔒 Your information is secure and encrypted.
          </p>
        </>
      )}
      {error && <p style={{ color: "#B91C1C", marginTop: 12 }}>{error}</p>}

      {showSelfieCam && (
        <SelfieCamera
          onCapture={handleSelfieCapture}
          onClose={() => setShowSelfieCam(false)}
        />
      )}
    </div>
  );
}