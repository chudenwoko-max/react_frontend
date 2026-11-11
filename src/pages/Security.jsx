import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Security() {
  const { logout } = useAuth();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [lockPin, setLockPin] = useState("");
  const [lockingWallet, setLockingWallet] = useState(false);
  const [lockError, setLockError] = useState("");

  // 2FA setup state
  const [setupData, setSetupData] = useState(null); // { qr_code, secret }
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    axiosClient.get("/2fa/status/")
      .then((res) => setIs2FAEnabled(res.data.is_2fa_enabled))
      .catch(() => {});
  }, []);

  const startSetup = async () => {
    setLoading2FA(true);
    try {
      const res = await axiosClient.post("/2fa/setup/");
      setSetupData(res.data);
    } catch {
      toast.error("Failed to start 2FA setup");
    } finally {
      setLoading2FA(false);
    }
  };

  const verifyAndEnable = async () => {
    if (verifyCode.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setVerifying(true);
    try {
      await axiosClient.post("/2fa/verify-setup/", { code: verifyCode });
      setIs2FAEnabled(true);
      setSetupData(null);
      setVerifyCode("");
      toast.success("Two-factor authentication enabled");
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid code");
    } finally {
      setVerifying(false);
    }
  };

  const disable2FA = async () => {
    setLoading2FA(true);
    try {
      await axiosClient.post("/2fa/disable/");
      setIs2FAEnabled(false);
      toast.success("Two-factor authentication disabled");
    } catch {
      toast.error("Failed to disable 2FA");
    } finally {
      setLoading2FA(false);
    }
  };

  const lockWalletNow = async (e) => {
    e.preventDefault();
    if (lockingWallet) return;
    setLockingWallet(true);
    setLockError("");
    try {
      await axiosClient.post("wallet/lock/", { pin: lockPin.trim() });
      localStorage.setItem("WALLET_FROZEN", "true");
      setLockDialogOpen(false);
      setLockPin("");
      window.alert("Wallet locked. All sessions signed out.");
      await logout();
    } catch (err) {
      setLockError(err.response?.data?.error || "Could not lock wallet");
      setLockingWallet(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 28px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Security</h1>
      <p style={{ color: "#6b7280", marginTop: 4 }}>Manage login and wallet security</p>

      <div style={{ background: "#fff", borderRadius: 16, padding: 28, border: "1px solid #f3f4f6", marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>Two-factor authentication</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
              {is2FAEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>
          {is2FAEnabled ? (
            <button
              onClick={disable2FA}
              disabled={loading2FA}
              style={{
                padding: "9px 18px",
                borderRadius: 8,
                border: "1px solid #fecaca",
                background: "#fef2f2",
                color: "#dc2626",
                cursor: "pointer",
              }}
            >
              {loading2FA ? "Please wait…" : "Disable"}
            </button>
          ) : (
            <button
              onClick={startSetup}
              disabled={loading2FA}
              style={{
                padding: "9px 18px",
                borderRadius: 8,
                border: "1px solid #bbf7d0",
                background: "#f0fdf4",
                color: "#16a34a",
                cursor: "pointer",
              }}
            >
              {loading2FA ? "Please wait…" : "Enable"}
            </button>
          )}
        </div>

        {/* Setup modal / inline */}
        {setupData && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f3f4f6" }}>
            <p style={{ margin: "0 0 12px", fontWeight: 600 }}>Scan the QR code</p>
            <img
              src={setupData.qr_code}
              alt="2FA QR Code"
              style={{ width: 200, height: 200, marginBottom: 12 }}
            />
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 12px" }}>
              Or enter this secret manually: <code>{setupData.secret}</code>
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit code"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                marginBottom: 12,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setSetupData(null)}
                style={{ padding: "10px 16px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff" }}
              >
                Cancel
              </button>
              <button
                onClick={verifyAndEnable}
                disabled={verifying}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: 8,
                  background: "#16a34a",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                {verifying ? "Verifying…" : "Verify & Enable"}
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginTop: 24, paddingTop: 20, borderTop: "1px solid #f3f4f6" }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>Lock wallet now</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
              Freeze wallet and sign out all sessions
            </p>
          </div>
          <button
            onClick={() => { setLockPin(""); setLockError(""); setLockDialogOpen(true); }}
            style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", fontWeight: 600, cursor: "pointer" }}
          >
            Lock wallet
          </button>
        </div>
      </div>

      {lockDialogOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <form onSubmit={lockWalletNow} style={{ background: "#fff", padding: 24, borderRadius: 16, width: "90%", maxWidth: 400 }}>
            <h3 style={{ margin: 0 }}>Lock wallet now?</h3>
            <p style={{ color: "#4b5563", fontSize: 14 }}>All sessions will be signed out.</p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={lockPin}
              onChange={(e) => setLockPin(e.target.value)}
              placeholder="Enter PIN"
              required
              style={{ width: "100%", padding: 12, margin: "12px 0", borderRadius: 8, border: "1px solid #d1d5db", boxSizing: "border-box" }}
            />
            {lockError && <p style={{ color: "#b91c1c", fontSize: 13 }}>{lockError}</p>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
              <button type="button" onClick={() => setLockDialogOpen(false)} style={{ padding: "10px 16px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff" }}>
                Cancel
              </button>
              <button type="submit" disabled={lockingWallet || !lockPin.trim()} style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: "#b91c1c", color: "#fff", fontWeight: 600 }}>
                {lockingWallet ? "Locking…" : "Lock wallet"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}