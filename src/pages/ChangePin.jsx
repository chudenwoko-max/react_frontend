import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

function PinBoxes({ value, onChange, disabled }) {
  return (
    <div style={styles.pinContainer}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={styles.pinBox}>
          {value[i] ? "•" : ""}
        </div>
      ))}
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
        maxLength={4}
        disabled={disabled}
        style={styles.hiddenInput}
      />
    </div>
  );
}

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
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Change Transfer PIN</h2>
        <p style={styles.subtitle}>Enter your current PIN and choose a new one</p>

        <form onSubmit={handleChangePin}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Current PIN</label>
            <PinBoxes value={currentPin} onChange={setCurrentPin} disabled={loading} />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>New PIN</label>
            <PinBoxes value={newPin} onChange={setNewPin} disabled={loading} />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm new PIN</label>
            <PinBoxes value={confirmPin} onChange={setConfirmPin} disabled={loading} />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Changing…" : "Change PIN"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    padding: 16,
  },
  card: {
    background: "#fff",
    padding: "32px 28px",
    borderRadius: 16,
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 6px",
  },
  subtitle: {
    color: "#64748b",
    fontSize: 14,
    margin: "0 0 24px",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 8,
  },
  pinContainer: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    gap: 12,
  },
  pinBox: {
    width: 48,
    height: 56,
    border: "1.5px solid #d1d5db",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 700,
    color: "#111827",
    background: "#fff",
  },
  hiddenInput: {
    position: "absolute",
    inset: 0,
    opacity: 0,
    cursor: "text",
    width: "100%",
    height: "100%",
  },
  button: {
    width: "100%",
    padding: "13px",
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    marginTop: 8,
  },
};