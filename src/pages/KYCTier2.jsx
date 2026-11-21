import { useEffect, useRef, useState } from "react";
import axiosClient from "../axiosClient";
import { useNavigate } from "react-router-dom";

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
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera not supported");
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
          const check = () => (video.videoWidth > 0 ? resolve() : setTimeout(check, 100));
          check();
        });
        setReady(true);
      }
    } catch (err) {
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
            const check = () => (video.videoWidth > 0 ? resolve() : setTimeout(check, 100));
            check();
          });
          setReady(true);
        }
      } catch {
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
    if (!video || !video.videoWidth) {
      setError("Camera not ready yet.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
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

export default function KYCTier2({ backendHasBvn = false, backendHasNin = false }) {
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSelfieCam, setShowSelfieCam] = useState(false);
  const navigate = useNavigate();

  const isValid = () => {
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
  };

  const formIsValid = isValid();

  const handleSubmit = async () => {
    if (!formIsValid) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      if (values.government_id_type) formData.append("government_id_type", values.government_id_type);
      if (files.government_id) formData.append("government_id", files.government_id);
      if (files.selfie) formData.append("selfie", files.selfie);
      if (files.proof_of_address) formData.append("proof_of_address", files.proof_of_address);
      if (values.bvn?.trim()) formData.append("bvn", values.bvn.trim());
      if (values.nin?.trim()) formData.append("nin", values.nin.trim());

      await axiosClient.post("kyc/upgrade/", formData, {
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

  return (
    <div>
      <style>{`
        input:-webkit-autofill,
        select:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #ffffff inset !important;
          box-shadow: 0 0 0 30px #ffffff inset !important;
          -webkit-text-fill-color: #0f172a !important;
        }
        input, select { background-color: #ffffff !important; }
      `}</style>

      <p style={{ color: "#64748B", marginBottom: 16 }}>
        Upload government ID, take a live selfie and provide proof of address.
      </p>

      {/* BVN / NIN if still missing */}
      {!backendHasBvn && (
        <div style={{ marginBottom: 16 }}>
          <RequiredLabel required={false}>BVN (11 digits)</RequiredLabel>
          <input
            type="tel"
            value={values.bvn || ""}
            onChange={(e) => setValues({ ...values, bvn: e.target.value.replace(/\D/g, "") })}
            maxLength={11}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}
          />
        </div>
      )}
      {!backendHasNin && (
        <div style={{ marginBottom: 16 }}>
          <RequiredLabel required={false}>NIN (11 digits)</RequiredLabel>
          <input
            type="tel"
            value={values.nin || ""}
            onChange={(e) => setValues({ ...values, nin: e.target.value.replace(/\D/g, "") })}
            maxLength={11}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}
          />
        </div>
      )}

      {/* Government ID type */}
      <div style={{ marginBottom: 16 }}>
        <RequiredLabel required>Government ID type</RequiredLabel>
        <select
          value={values.government_id_type || ""}
          onChange={(e) => setValues({ ...values, government_id_type: e.target.value })}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}
        >
          <option value="">Select ID type</option>
          <option value="national_id">National ID (NIN Slip / Card)</option>
          <option value="passport">International Passport</option>
          <option value="drivers_license">Driver's Licence</option>
          <option value="voters_card">Voter's Card (PVC)</option>
        </select>
      </div>

      {/* Government ID file */}
      <div style={{ marginBottom: 16 }}>
        <RequiredLabel required>Government ID</RequiredLabel>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
          onChange={(e) => setFiles({ ...files, government_id: e.target.files[0] })}
          style={{ width: "100%", padding: "10px 0" }}
        />
        <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>PDF or image (JPG, PNG)</p>
        {files.government_id && (
          <span style={{ color: "#166534", display: "block", marginTop: 4 }}>✓ {files.government_id.name}</span>
        )}
      </div>

      {/* Live selfie only */}
      <div style={{ marginBottom: 16 }}>
        <RequiredLabel required>Selfie (live camera only)</RequiredLabel>
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
        {files.selfie && <span style={{ color: "#166534", marginLeft: 10 }}>✓ Selfie accepted</span>}
      </div>

      {/* Proof of address */}
      <div style={{ marginBottom: 16 }}>
        <RequiredLabel required>Proof of address</RequiredLabel>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
          onChange={(e) => setFiles({ ...files, proof_of_address: e.target.files[0] })}
          style={{ width: "100%", padding: "10px 0" }}
        />
        <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>PDF or image (JPG, PNG)</p>
        {files.proof_of_address && (
          <span style={{ color: "#166534", display: "block", marginTop: 4 }}>✓ {files.proof_of_address.name}</span>
        )}
      </div>

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
        {loading ? "Submitting..." : "Submit Tier 2"}
      </button>

      {error && <p style={{ color: "#B91C1C", marginTop: 12 }}>{error}</p>}

      {showSelfieCam && (
        <SelfieCamera
          onCapture={(file) => setFiles((prev) => ({ ...prev, selfie: file }))}
          onClose={() => setShowSelfieCam(false)}
        />
      )}
    </div>
  );
}