import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function ChangePin() {
  const navigate = useNavigate();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePin = async (event) => {
    event.preventDefault();
    if (loading) return;
    if (currentPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
      toast.error("PIN must be exactly 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("New PINs do not match");
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post("change-pin/", {
        current_pin: currentPin,
        new_pin: newPin,
        confirm_pin: confirmPin,
      });
      toast.success("PIN changed successfully");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 24 }}>
      <h2 style={{ marginBottom: 20 }}>Change Transfer PIN</h2>
      <form onSubmit={handleChangePin}>
        <input
          type="password"
          placeholder="Current PIN"
          inputMode="numeric"
          maxLength={4}
          value={currentPin}
          onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          required
          disabled={loading}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="New PIN"
          inputMode="numeric"
          maxLength={4}
          value={newPin}
          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          required
          disabled={loading}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Confirm new PIN"
          inputMode="numeric"
          maxLength={4}
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          required
          disabled={loading}
          style={inputStyle}
        />
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Changing..." : "Change PIN"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: 12,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  boxSizing: "border-box",
  fontSize: 16,
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#0F172A",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer",
};