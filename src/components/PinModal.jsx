import { useState } from "react";
import axiosClient from "../axiosClient";

export default function PinModal({
  open,
  onClose,
  onVerified,
  mode = "set",
  actionLabel = "Transfer",
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(value);
    setError("");
  };

  const handleSetPin = async () => {
    if (pin.length !== 4) {
      setError("Enter a 4-digit PIN");
      return;
    }
    try {
      await axiosClient.post("/set-pin/", { pin });
      localStorage.setItem("HAS_PIN", "true");
      onVerified?.(pin);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to set PIN");
    }
  };

  const handleVerifyPin = async () => {
    if (pin.length !== 4) {
      setError("Enter a 4-digit PIN");
      return;
    }
    try {
      const res = await axiosClient.post("/verify-pin/", { pin });
      if (res.data.pin_token) {
        localStorage.setItem("PIN_TOKEN", res.data.pin_token);
      }
      onVerified?.(pin);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Incorrect PIN");
    }
  };

  const handleSubmit = mode === "set" ? handleSetPin : handleVerifyPin;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>
          {mode === "set" ? "Create Your PIN" : "Enter PIN to Confirm"}
        </h3>

        <div style={styles.pinContainer}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={styles.pinBox}>
              {pin[i] ? "•" : ""}
            </div>
          ))}
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={handleChange}
            maxLength={4}
            style={styles.hiddenInput}
            autoFocus
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={handleSubmit} style={styles.primaryBtn}>
  {mode === "set" ? "Set PIN" : `Confirm ${actionLabel}`}
</button>

        <button onClick={onClose} style={styles.cancelBtn}>
          Cancel
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    background: "white",
    padding: "32px 28px",
    borderRadius: 16,
    width: "100%",
    maxWidth: 340,
    textAlign: "center",
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
  },
  title: {
    margin: "0 0 24px",
    fontSize: 18,
    fontWeight: 600,
    color: "#111827",
  },
  pinContainer: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
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
  error: {
    color: "#dc2626",
    margin: "0 0 16px",
    fontSize: 13,
  },
  primaryBtn: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
  },
  cancelBtn: {
    marginTop: 12,
    background: "transparent",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    fontSize: 14,
  },
};