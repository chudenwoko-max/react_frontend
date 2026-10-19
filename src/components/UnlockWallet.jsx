import { useState } from "react";
import axiosClient from "../axiosClient";

const btn = {
  background: "#0F172A",
  color: "#fff",
  border: "none",
  padding: "12px 16px",
  borderRadius: 8,
  cursor: "pointer",
};

const input = {
  display: "block",
  boxSizing: "border-box",
  width: "100%",
  padding: 10,
  margin: "8px 0",
  border: "1px solid #ccc",
  borderRadius: 8,
};

function errorMessage(error, fallback) {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  return data?.error || data?.detail || data?.message || fallback;
}

export default function UnlockWallet({ onUnlocked, profileRefreshing = false }) {
  const [step, setStep] = useState("request");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [completed, setCompleted] = useState(false);

  const requestCode = async () => {
    if (loading) return;
    setLoading(true);
    setMsg("");
    try {
      await axiosClient.post(
        "wallet/unlock/request/",
        null,
        { headers: { "X-Payhost-Client": "web" } }
      );
      setStep("verify");
      setMsg("Code sent to your email.");
    } catch (error) {
      setMsg(errorMessage(error, "Could not send code"));
    } finally {
      setLoading(false);
    }
  };

  const unlock = async (event) => {
    event.preventDefault();
    if (loading) return;
    if (!/^\d{6}$/.test(otp.trim())) {
      setMsg("Enter the 6-digit code sent to your email.");
      return;
    }
    if (!pin.trim()) {
      setMsg("Enter your PIN.");
      return;
    }

    setLoading(true);
    setMsg("");
    let response;
    try {
      response = await axiosClient.post(
        "wallet/unlock/",
        { otp: otp.trim(), pin: pin.trim() },
        { headers: { "X-Payhost-Client": "web" } }
      );
    } catch (error) {
      setMsg(errorMessage(error, "Could not unlock wallet"));
      setLoading(false);
      return;
    }

    setLoading(false);
    const continueUnlock = await onUnlocked?.(response);
    if (continueUnlock === false) {
      setMsg("Your wallet is still frozen. Please try again.");
      return;
    }
    setMsg("Wallet unlocked.");
    setCompleted(true);
  };

  if (completed) {
    return (
      <section style={{ maxWidth: 440, margin: "40px auto", padding: 24 }}>
        <h2>Wallet unlocked</h2>
        <p role="status">
          {profileRefreshing
            ? "Refreshing your profile..."
            : "Your wallet is unlocked. You can sign in to continue."}
        </p>
      </section>
    );
  }

  if (step === "request") {
    return (
      <section style={{ maxWidth: 440, margin: "40px auto", padding: 24 }}>
        <h2>Wallet locked</h2>
        <p>Request an email code to unlock your wallet.</p>
        <button type="button" onClick={requestCode} disabled={loading} style={btn}>
          {loading ? "Sending..." : "Send unlock code"}
        </button>
        {msg && <p role="status">{msg}</p>}
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 440, margin: "40px auto", padding: 24 }}>
      <h2>Unlock wallet</h2>
      <p>Enter the code sent to your email and your PIN.</p>
      <form onSubmit={unlock}>
        <label htmlFor="wallet-unlock-otp">Email code</label>
        <input
          id="wallet-unlock-otp"
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
          placeholder="6-digit code"
          disabled={loading}
          style={input}
        />
        <label htmlFor="wallet-unlock-pin">PIN</label>
        <input
          id="wallet-unlock-pin"
          type="password"
          autoComplete="current-password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
          placeholder="PIN"
          disabled={loading}
          style={input}
        />
        <button type="submit" disabled={loading || !otp || !pin} style={btn}>
          {loading ? "Unlocking..." : "Confirm unlock"}
        </button>
      </form>
      {msg && <p role="status">{msg}</p>}
    </section>
  );
}
