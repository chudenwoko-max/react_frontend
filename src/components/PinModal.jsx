import { useState } from "react";
import axiosClient from "../axiosClient";

export default function PinModal({ open, onClose, onVerified, mode = "set" }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  // SET PIN
  const handleSetPin = async () => {
  try {
    await axiosClient.post("/set-pin/", { pin });
    localStorage.setItem("HAS_PIN", "true");
    onVerified?.(pin);
    onClose();
  } catch (err) {
    setError(err.response?.data?.error || "Failed to set PIN");
  }
};

  // VERIFY PIN
  const handleVerifyPin = async () => {
    try {
      const res = await axiosClient.post("/verify-pin/", {
        pin: String(pin),
      });

      if (res.data.pin_token) {
        localStorage.setItem("PIN_TOKEN", res.data.pin_token);
      }

      onVerified(pin);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Incorrect PIN");
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
      <div style={{
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        width: "320px",
        textAlign: "center"
      }}>
        <h3>{mode === "set" ? "Create Your PIN" : "Enter PIN to Confirm"}</h3>

        <input
          type="password"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter 4-digit PIN"
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "18px",
            textAlign: "center",
            margin: "16px 0",
            borderRadius: "8px",
            border: "1px solid #ccc"
          }}
        />

        {error && <p style={{ color: "red", margin: "8px 0" }}>{error}</p>}

        {mode === "set" ? (
          <button
            onClick={handleSetPin}
            style={{
              width: "100%",
              padding: "12px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Set PIN
          </button>
        ) : (
          <button
            onClick={handleVerifyPin}
            style={{
              width: "100%",
              padding: "12px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Confirm Transfer
          </button>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: "12px",
            background: "transparent",
            border: "none",
            color: "#666",
            cursor: "pointer"
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}