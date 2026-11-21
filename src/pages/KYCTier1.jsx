import { useState } from "react";
import axiosClient from "../axiosClient";
import { useNavigate } from "react-router-dom";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
];

function RequiredLabel({ children, required }) {
  return (
    <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
      {children}
      {required && <span style={{ color: "#B91C1C" }}> *</span>}
    </label>
  );
}

export default function KYCTier1() {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isValid = () => {
    const required = ["full_name", "date_of_birth", "gender", "phone_number", "address", "city", "state"];
    for (const f of required) {
      if (!values[f]?.trim()) return false;
    }
    const bvn = values.bvn?.replace(/\D/g, "") || "";
    const nin = values.nin?.replace(/\D/g, "") || "";
    return bvn.length === 11 || nin.length === 11;
  };

  const formIsValid = isValid();

  const handleSubmit = async () => {
    if (!formIsValid) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      ["full_name", "date_of_birth", "gender", "phone_number", "address", "city", "state", "bvn", "nin"].forEach((field) => {
        if (values[field]?.trim()) formData.append(field, values[field].trim());
      });
      await axiosClient.post("kyc/submit/", formData, {
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
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active,
        select:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #ffffff inset !important;
          box-shadow: 0 0 0 30px #ffffff inset !important;
          -webkit-text-fill-color: #0f172a !important;
          transition: background-color 9999s ease-in-out 0s;
        }
        input, select { background-color: #ffffff !important; }
      `}</style>

      <p style={{ color: "#64748B", marginBottom: 16 }}>
        Provide your personal details and either BVN or NIN.
      </p>
      

      {/* Full legal name */}
      <div style={{ marginBottom: 16 }}>
        <RequiredLabel required>Full legal name</RequiredLabel>
        <input
          type="text"
          value={values.full_name || ""}
          onChange={(e) => setValues({ ...values, full_name: e.target.value })}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}
        />
      </div>

      {/* Date of birth */}
      <div style={{ marginBottom: 16 }}>
        <RequiredLabel required>Date of birth</RequiredLabel>
        <input
          type="date"
          value={values.date_of_birth || ""}
          onChange={(e) => setValues({ ...values, date_of_birth: e.target.value })}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}
        />
      </div>

      {/* Gender */}
      <div style={{ marginBottom: 16 }}>
        <RequiredLabel required>Gender</RequiredLabel>
        <select
          value={values.gender || ""}
          onChange={(e) => setValues({ ...values, gender: e.target.value })}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Phone */}
      <div style={{ marginBottom: 16 }}>
        <RequiredLabel required>Phone number</RequiredLabel>
        <input
          type="tel"
          value={values.phone_number || ""}
          onChange={(e) => setValues({ ...values, phone_number: e.target.value.replace(/\D/g, "") })}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}
        />
      </div>

      {/* Address */}
      <div style={{ marginBottom: 16 }}>
        <RequiredLabel required>Street address</RequiredLabel>
        <input
          type="text"
          value={values.address || ""}
          onChange={(e) => setValues({ ...values, address: e.target.value })}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}
        />
      </div>

      {/* City */}
      <div style={{ marginBottom: 16 }}>
        <RequiredLabel required>City</RequiredLabel>
        <input
          type="text"
          value={values.city || ""}
          onChange={(e) => setValues({ ...values, city: e.target.value })}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}
        />
      </div>

      {/* State */}
      <div style={{ marginBottom: 16 }}>
        <RequiredLabel required>State</RequiredLabel>
        <select
          value={values.state || ""}
          onChange={(e) => setValues({ ...values, state: e.target.value })}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}
        >
          <option value="">Select state</option>
          {NIGERIAN_STATES.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>

      {/* BVN */}
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

      {/* NIN */}
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
        {loading ? "Submitting..." : "Submit Tier 1"}
      </button>

      {error && <p style={{ color: "#B91C1C", marginTop: 12 }}>{error}</p>}
    </div>
  );
}