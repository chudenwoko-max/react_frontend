import { useState } from "react";
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

export default function KYCTier3() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const formIsValid = !!file;

  const handleSubmit = async () => {
    if (!formIsValid) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("proof_of_address", file);
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
      <p style={{ color: "#64748B", marginBottom: 16 }}>
        Upload a stronger proof of address to complete enhanced verification.
      </p>

      <p style={{ fontSize: 13, color: "#475569", background: "#f8fafc", padding: 10, borderRadius: 8, marginBottom: 12 }}>
        Acceptable documents (must show your name and address, usually not older than 3 months):
        <br />• Electricity / PHCN bill
        <br />• Water or waste-management bill
        <br />• Bank statement
        <br />• Stamped tenancy / rental agreement
        <br />• Tax clearance certificate or Land Use Charge receipt
        <br />• Estate or serviced-apartment receipt
      </p>

      <div style={{ marginBottom: 16 }}>
        <RequiredLabel required>Proof of address</RequiredLabel>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
          onChange={(e) => setFile(e.target.files[0] || null)}
          style={{ width: "100%", padding: "10px 0" }}
        />
        <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>PDF or image (JPG, PNG)</p>
        {file && (
          <span style={{ color: "#166534", display: "block", marginTop: 4 }}>✓ {file.name}</span>
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
        {loading ? "Submitting..." : "Submit Tier 3"}
      </button>

      {error && <p style={{ color: "#B91C1C", marginTop: 12 }}>{error}</p>}
    </div>
  );
}