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

  useEffect(() => {
    axiosClient.get("/2fa/status/")
      .then((res) => setIs2FAEnabled(res.data.is_2fa_enabled))
      .catch(() => {});
  }, []);

  const toggle2FA = async () => {
    setLoading2FA(true);
    try {
      if (is2FAEnabled) {
        await axiosClient.post("/2fa/disable/");
        setIs2FAEnabled(false);
        toast.success("Two-factor authentication disabled");
      } else {
        await axiosClient.post("/2fa/enable/");
        setIs2FAEnabled(true);
        toast.success("Two-factor authentication enabled");
      }
    } catch {
      toast.error("Failed to update 2FA");
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
          <button
            onClick={toggle2FA}
            disabled={loading2FA}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "1px solid",
              background: is2FAEnabled ? "#fef2f2" : "#f0fdf4",
              color: is2FAEnabled ? "#dc2626" : "#16a34a",
              cursor: "pointer",
            }}
          >
            {loading2FA ? "Please wait…" : is2FAEnabled ? "Disable" : "Enable"}
          </button>
        </div>

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