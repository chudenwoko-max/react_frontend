import { useState } from "react";
import axiosClient from "../axiosClient";

function errorMessage(error, fallback) {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  return data?.error || data?.detail || data?.message || fallback;
}

export function ClearHoldButton({ onCleared }) {
  const [step, setStep] = useState("idle");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const requestCode = async () => {
    setLoading(true);
    setMsg("");
    try {
      await axiosClient.post("payment-hold/request-clear/", null, {
        headers: { "X-Payhost-Client": "web" },
      });
      setStep("otp");
      setMsg("Code sent to your email.");
    } catch (error) {
      setMsg(errorMessage(error, "Could not send code"));
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (!otp.trim()) {
      setMsg("Enter the code sent to your email.");
      return;
    }

    setLoading(true);
    setMsg("");
    try {
      await axiosClient.post(
        "payment-hold/verify-clear/",
        { otp: otp.trim(), pin: pin.trim() || undefined },
        { headers: { "X-Payhost-Client": "web" } }
      );
      setMsg("Payment hold cleared.");
      setStep("idle");
      setOtp("");
      setPin("");
      onCleared?.();
    } catch (error) {
      setMsg(errorMessage(error, "Invalid code"));
    } finally {
      setLoading(false);
    }
  };

  if (step === "idle") {
    return (
      <div>
        <button type="button" onClick={requestCode} disabled={loading}>
          {loading ? "Sending..." : "Verify to unlock now"}
        </button>
        {msg && <p role="status">{msg}</p>}
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="6-digit code"
        value={otp}
        onChange={(event) => setOtp(event.target.value)}
        maxLength={6}
        disabled={loading}
      />
      <input
        type="password"
        autoComplete="current-password"
        placeholder="Transaction PIN (optional)"
        value={pin}
        onChange={(event) => setPin(event.target.value)}
        disabled={loading}
      />
      <button type="button" onClick={verify} disabled={loading}>
        {loading ? "Verifying..." : "Clear hold"}
      </button>
      {msg && <p role="status">{msg}</p>}
    </div>
  );
}
