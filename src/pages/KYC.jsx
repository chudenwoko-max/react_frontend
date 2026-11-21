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

const TIER_INFO = {
  "1": { title: "Tier 1", daily: "₦50,000", perTx: "₦50,000", balance: "₦300,000", desc: "Basic verification" },
  "2": { title: "Tier 2", daily: "₦200,000", perTx: "₦200,000", balance: "₦500,000", desc: "Full identity + address" },
  "3": { title: "Tier 3", daily: "₦5,000,000", perTx: "₦1,000,000", balance: "Unlimited", desc: "Enhanced verification" },
};

function getFieldLabel(field) {
  return fieldLabels[field] || field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function RequiredLabel({ children, required }) {
  return (
    <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
      {children}
      {required && <span style={{ color: "#B91C1C" }}> *</span>}
    </label>
  );
}

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mime = (header.match(/:(.*?);/) || [])[1] || "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function SelfieCamera({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [capturedFile, setCapturedFile] = useState(null);
  const [ready, setReady] = useState(false);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startCamera = async () => {
    setError("");
    setReady(false);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera not supported in this browser.");
      }
      // Force front camera only
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "user" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
        await new Promise((resolve) => {
          const check = () => {
            if (video.videoWidth > 0) resolve();
            else setTimeout(check, 100);
          };
          check();
        });
        setReady(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      // Fallback without "exact" in case the device rejects it
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          await new Promise((resolve) => {
            const check = () => {
              if (video.videoWidth > 0) resolve();
              else setTimeout(check, 100);
            };
            check();
          });
          setReady(true);
        }
      } catch (fallbackErr) {
        console.error("Camera fallback error:", fallbackErr);
        setError("Camera is required for selfie verification. Please allow camera access and try again.");
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopStream();
  }, []);

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) {
      setError("Camera not ready yet.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    ctx.restore();
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const blob = dataUrlToBlob(dataUrl);
    const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: "image/jpeg" });
    setCapturedFile(file);
    setPreviewUrl(dataUrl);
    stopStream();
  };

  const retake = async () => {
    setPreviewUrl("");
    setCapturedFile(null);
    await startCamera();
  };

  const accept = () => {
    if (capturedFile) onCapture(capturedFile);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.72)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#0f172a", color: "#fff", borderRadius: 20, width: "100%", maxWidth: 420, padding: "16px 16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontWeight: 600 }}>Take a selfie</span>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", borderRadius: 16, overflow: "hidden", background: "#1e293b" }}>
          {previewUrl ? (
            <img src={previewUrl} alt="Selfie" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
          )}
        </div>
        {error && <p style={{ color: "#fca5a5", textAlign: "center", marginTop: 8 }}>{error}</p>}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
          {previewUrl ? (
            <>
              <button type="button" onClick={retake} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #fff", background: "transparent", color: "#fff" }}>Retake</button>
              <button type="button" onClick={accept} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff" }}>Accept</button>
            </>
          ) : (
            <button
              type="button"
              onClick={takePhoto}
              disabled={!ready || !!error}
              style={{ width: 68, height: 68, borderRadius: "50%", border: "4px solid #fff", background: "#2563eb", opacity: ready && !error ? 1 : 0.5 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function KYC() {
  const [status, setStatus] = useState("");
  const [missing, setMissing] = useState(null);
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
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const navigate = useNavigate();

  const isApproved = ["approved", "verified"].includes((status || "").toLowerCase());
  const isPending = (status || "").toLowerCase() === "pending";
  const currentTier = Number(limits?.tier || 0);
  const isFullyVerified = isApproved && !isPending && currentTier >= 3;

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
    setFiles((prev) => ({ ...prev, selfie: file }));
  };

  // ---------- Screen / form decision (no auto-jump) ----------
  let mode = "loading"; // "pending" | "fullyVerified" | "tierStatus" | "form"
  let displayTier = "1";
  let fieldsToRender = [];

  if (isPending) {
    mode = "pending";
    displayTier = String(currentTier || 1);
  } else if (isFullyVerified) {
    mode = "fullyVerified";
    displayTier = "3";
  } else if (isApproved && !showUpgradeForm) {
    // Approved at Tier 1 or 2 → always show stable status screen.
    // Never auto-open the next form.
    mode = "tierStatus";
    displayTier = String(Math.max(currentTier, 1));
  } else if (!isApproved) {
    // Brand-new user → Tier 1 form
    mode = "form";
    displayTier = "1";
    fieldsToRender = [
      "full_name", "date_of_birth", "gender", "phone_number",
      "address", "city", "state", "bvn", "nin",
    ];
  } else if (currentTier < 2) {
    // Approved at Tier 1 + user clicked "Upgrade to Tier 2"
    mode = "form";
    displayTier = "2";
    fieldsToRender = ["government_id_type", "government_id", "selfie", "proof_of_address"];
    if (!backendHasBvn) fieldsToRender.unshift("bvn");
    if (!backendHasNin) fieldsToRender.unshift("nin");
  } else {
    // Approved at Tier 2 + user clicked "Upgrade to Tier 3"
    mode = "form";
    displayTier = "3";
    fieldsToRender = ["proof_of_address"];
  }

  const tierInfo = TIER_INFO[displayTier] || TIER_INFO["1"];

  // ---------- Validation ----------
  const isFormValid = () => {
    if (mode !== "form") return false;

    if (displayTier === "1") {
      const required = ["full_name", "date_of_birth", "gender", "phone_number", "address", "city", "state"];
      for (const f of required) {
        if (!values[f]?.trim()) return false;
      }
      const bvn = values.bvn?.replace(/\D/g, "") || "";
      const nin = values.nin?.replace(/\D/g, "") || "";
      if (bvn.length !== 11 && nin.length !== 11) return false;
      return true;
    }

    if (displayTier === "2") {
      if (!values.government_id_type?.trim()) return false;
      if (!files.government_id) return false;
      if (!files.selfie) return false;
      if (!files.proof_of_address) return false;

      if (!backendHasBvn && !backendHasNin) {
        const bvn = values.bvn?.replace(/\D/g, "") || "";
        const nin = values.nin?.replace(/\D/g, "") || "";
        if (bvn.length !== 11 && nin.length !== 11) return false;
      } else {
        if (!backendHasBvn) {
          const bvn = values.bvn?.replace(/\D/g, "") || "";
          if (bvn.length !== 11) return false;
        }
        if (!backendHasNin) {
          const nin = values.nin?.replace(/\D/g, "") || "";
          if (nin.length !== 11) return false;
        }
      }
      return true;
    }

    if (displayTier === "3") {
      // Only proof of address is required
      return !!files.proof_of_address;
    }

    return false;
  };

  const formIsValid = isFormValid();

  const handleSubmit = async () => {
    if (!formIsValid) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      for (const field of fieldsToRender) {
        if (fileFields.has(field)) {
          if (files[field]) formData.append(field, files[field]);
        } else if (values[field]?.trim()) {
          formData.append(field, values[field].trim());
        }
      }
      const endpoint = isApproved ? "kyc/upgrade/" : "kyc/submit/";
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

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      {/* Kill browser autofill yellow background */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active,
        select:-webkit-autofill,
        select:-webkit-autofill:hover,
        select:-webkit-autofill:focus,
        select:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #ffffff inset !important;
          box-shadow: 0 0 0 30px #ffffff inset !important;
          -webkit-text-fill-color: #0f172a !important;
          transition: background-color 9999s ease-in-out 0s;
          caret-color: #0f172a;
        }
        input, select {
          background-color: #ffffff !important;
        }
      `}</style>

      <h1 style={{ fontFamily: "serif", fontSize: 26, marginBottom: 12 }}>Get Verified</h1>

      <div style={{ background: "#eff6ff", padding: 14, borderRadius: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1e40af" }}>{tierInfo.title}</div>
        <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>{tierInfo.desc}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginTop: 6 }}>
          Daily: {tierInfo.daily} · Per transaction: {tierInfo.perTx}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
          Balance limit: {tierInfo.balance}
        </div>
      </div>

      {status && <p style={{ color: "#475569" }}>Status: {status.toUpperCase()}</p>}

      {/* ========== FULLY VERIFIED ========== */}
      {mode === "fullyVerified" && (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <p style={{ color: "#166534", fontWeight: 600, fontSize: 18 }}>Fully verified</p>
          <p style={{ color: "#64748B", marginTop: 8 }}>Your account is at the highest tier. No further action is required.</p>
        </div>
      )}

      {/* ========== PENDING ========== */}
      {mode === "pending" && (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <p style={{ color: "#92400e", fontWeight: 600 }}>Under review</p>
          <p style={{ color: "#64748B" }}>Your documents have been submitted and are awaiting approval.</p>
        </div>
      )}

      {/* ========== TIER STATUS (after approval – no auto-jump) ========== */}
      {mode === "tierStatus" && (
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <p style={{ color: "#166534", fontWeight: 600, fontSize: 16 }}>
            You are verified at {tierInfo.title}
          </p>
          <p style={{ color: "#64748B", marginTop: 8, marginBottom: 24 }}>
            You can continue using your account with the limits shown above, or upgrade for higher limits.
          </p>
          {currentTier < 3 && (
            <button
              type="button"
              onClick={() => setShowUpgradeForm(true)}
              style={{
                padding: "12px 24px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Upgrade to Tier {currentTier + 1}
            </button>
          )}
        </div>
      )}

      {/* ========== FORM ========== */}
      {mode === "form" && (
        <>
          <p style={{ color: "#64748B", marginBottom: 16 }}>
            {displayTier === "1" && "Provide your personal details and either BVN or NIN."}
            {displayTier === "2" && "Upload government ID, take a live selfie and provide proof of address."}
            {displayTier === "3" && "Upload a stronger proof of address to complete enhanced verification."}
          </p>

          {displayTier === "1" && (
            <p style={{ fontSize: 14, color: "#1e40af", background: "#eff6ff", padding: 10, borderRadius: 8, marginBottom: 12 }}>
              Provide either BVN or NIN (one is enough).
            </p>
          )}

          {displayTier === "3" && (
            <p style={{ fontSize: 13, color: "#475569", background: "#f8fafc", padding: 10, borderRadius: 8, marginBottom: 12 }}>
              Acceptable documents (must show your name and address, usually not older than 3 months):
              <br />• Electricity / PHCN bill
              <br />• Water or waste-management bill
              <br />• Bank statement
              <br />• Stamped tenancy / rental agreement
              <br />• Tax clearance certificate or Land Use Charge receipt
              <br />• Estate or serviced-apartment receipt
            </p>
          )}

          {fieldsToRender.map((field) => {
            const required = field !== "bvn" && field !== "nin";

            // Selfie – live camera only, no file upload
            if (field === "selfie") {
              return (
                <div key={field} style={{ marginBottom: 16 }}>
                  <RequiredLabel required={true}>Selfie (live camera only)</RequiredLabel>
                  <button
                    type="button"
                    onClick={() => setShowSelfieCam(true)}
                    style={{
                      padding: "12px 18px",
                      background: "#2563eb",
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

            // Other file fields (gov ID, proof of address)
            if (fileFields.has(field)) {
              return (
                <div key={field} style={{ marginBottom: 16 }}>
                  <RequiredLabel required={required}>{getFieldLabel(field)}</RequiredLabel>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
                    onChange={(e) => handleFile(field, e.target.files[0])}
                    style={{ width: "100%", padding: "10px 0" }}
                  />
                  <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
                    PDF or image (JPG, PNG)
                  </p>
                  {files[field] && (
                    <span style={{ color: "#166534", marginTop: 4, display: "block" }}>
                      ✓ {files[field].name}
                    </span>
                  )}
                </div>
              );
            }

            if (field === "gender") {
              return (
                <div key={field} style={{ marginBottom: 16 }}>
                  <RequiredLabel required={required}>Gender</RequiredLabel>
                  <select
                    value={values[field] || ""}
                    onChange={(e) => setValues({ ...values, [field]: e.target.value })}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}
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
                  <RequiredLabel required={required}>State</RequiredLabel>
                  <select
                    value={values[field] || ""}
                    onChange={(e) => setValues({ ...values, [field]: e.target.value })}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}
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
                  <RequiredLabel required={required}>Government ID type</RequiredLabel>
                  <select
                    value={values[field] || ""}
                    onChange={(e) => setValues({ ...values, [field]: e.target.value })}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}
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
                  <RequiredLabel required={required}>Date of birth</RequiredLabel>
                  <input
                    type="date"
                    value={values[field] || ""}
                    onChange={(e) => setValues({ ...values, [field]: e.target.value })}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}
                  />
                </div>
              );
            }

            if (field === "bvn" || field === "nin") {
              return (
                <div key={field} style={{ marginBottom: 16 }}>
                  <RequiredLabel required={false}>{getFieldLabel(field)}</RequiredLabel>
                  <input
                    type="tel"
                    value={values[field] || ""}
                    onChange={(e) => setValues({ ...values, [field]: e.target.value.replace(/\D/g, "") })}
                    maxLength={11}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}
                  />
                </div>
              );
            }

            return (
              <div key={field} style={{ marginBottom: 16 }}>
                <RequiredLabel required={required}>{getFieldLabel(field)}</RequiredLabel>
                <input
                  type={field === "phone_number" ? "tel" : "text"}
                  value={values[field] || ""}
                  onChange={(e) => {
                    let v = e.target.value;
                    if (field === "phone_number") v = v.replace(/\D/g, "");
                    setValues({ ...values, [field]: v });
                  }}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}
                />
              </div>
            );
          })}

          <button
            onClick={handleSubmit}
            disabled={loading || !formIsValid}
            style={{
              marginTop: 8,
              padding: "12px 20px",
              background: formIsValid && !loading ? "#2563eb" : "#94a3b8",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              cursor: formIsValid && !loading ? "pointer" : "not-allowed",
              fontWeight: 600,
              opacity: formIsValid && !loading ? 1 : 0.7,
            }}
          >
            {loading ? "Submitting..." : `Submit ${tierInfo.title}`}
          </button>
        </>
      )}

      {error && <p style={{ color: "#B91C1C", marginTop: 12 }}>{error}</p>}

      {showSelfieCam && (
        <SelfieCamera onCapture={handleSelfieCapture} onClose={() => setShowSelfieCam(false)} />
      )}
    </div>
  );
}