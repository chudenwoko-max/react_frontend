import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../axiosClient";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function Profile() {
  const { user, setUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [lockPin, setLockPin] = useState("");
  const [lockingWallet, setLockingWallet] = useState(false);
  const [lockError, setLockError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) {
          const res = await axiosClient.get("/profile/");
          setUser(res.data);
        }

        const statusRes = await axiosClient.get("/2fa/status/");
        setIs2FAEnabled(statusRes.data.is_2fa_enabled);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    } catch (err) {
      toast.error("Failed to update 2FA settings");
    } finally {
      setLoading2FA(false);
    }
  };

  const lockWalletNow = async (event) => {
    event.preventDefault();
    if (lockingWallet) return;

    setLockingWallet(true);
    setLockError("");
    try {
      await axiosClient.post(
        "wallet/lock/",
        { pin: lockPin.trim() },
        { headers: { "X-Payhost-Client": "web" } }
      );
    } catch (err) {
      setLockError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Could not lock wallet"
      );
      setLockingWallet(false);
      return;
    }

    setLockDialogOpen(false);
    setLockPin("");
    window.alert("Wallet locked. All sessions signed out.");
    await logout();
  };

  if (loading || !user) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Profile</h1>
        <p style={styles.subtitle}>Manage your account settings and security</p>
      </div>

      {/* Profile Card */}
      <div style={styles.card}>
        <div style={styles.avatarSection}>
          <img
            src={
              user.avatar ||
              `https://ui-avatars.com/api/?name=${user.username || "User"}&background=2563eb&color=fff&size=128`
            }
            alt="avatar"
            style={styles.avatar}
          />
          <div>
            <h2 style={styles.name}>{user.username}</h2>
            <p style={styles.email}>{user.email || "No email added"}</p>
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.infoGrid}>
          <div>
            <p style={styles.infoLabel}>Username</p>
            <p style={styles.infoValue}>{user.username}</p>
          </div>
          <div>
            <p style={styles.infoLabel}>Email</p>
            <p style={styles.infoValue}>{user.email || "—"}</p>
          </div>
          <div>
            <p style={styles.infoLabel}>Account Type</p>
            <p style={styles.infoValue}>Personal</p>
          </div>
          <div>
            <p style={styles.infoLabel}>Member Since</p>
            <p style={styles.infoValue}>
              {user.date_joined
                ? new Date(user.date_joined).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>

        <div style={styles.actions}>
          <Link to="/avatar-upload" style={styles.secondaryBtn}>
            Change Avatar
          </Link>
          <Link to="/kyc" style={styles.primaryBtn}>
            Verify Identity
          </Link>
        </div>
      </div>

      {/* Security Card - 2FA */}
      <div style={{ ...styles.card, marginTop: 20 }}>
        <h3 style={styles.sectionTitle}>Security</h3>

        <div style={styles.securityItem}>
          <div style={styles.securityInfo}>
            <div style={styles.securityIcon}>
              {is2FAEnabled ? "🔒" : "🔓"}
            </div>
            <div>
              <p style={styles.securityTitle}>Two-Factor Authentication</p>
              <p style={styles.securityDesc}>
                {is2FAEnabled
                  ? "Enabled — You’ll need a verification code when logging in"
                  : "Disabled — Add an extra layer of security to your account"}
              </p>
            </div>
          </div>

          <button
            onClick={toggle2FA}
            disabled={loading2FA}
            style={{
              ...styles.toggleBtn,
              background: is2FAEnabled ? "#fef2f2" : "#f0fdf4",
              color: is2FAEnabled ? "#dc2626" : "#16a34a",
              borderColor: is2FAEnabled ? "#fecaca" : "#bbf7d0",
            }}
          >
            {loading2FA ? "Please wait..." : is2FAEnabled ? "Disable" : "Enable"}
          </button>
        </div>

        <div style={styles.lockWalletItem}>
          <div>
            <p style={styles.securityTitle}>Lock wallet now</p>
            <p style={styles.securityDesc}>
              Freeze your wallet and sign out all sessions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLockPin("");
              setLockError("");
              setLockDialogOpen(true);
            }}
            style={styles.lockWalletBtn}
          >
            Lock wallet
          </button>
        </div>
      </div>

      {lockDialogOpen && (
        <div style={styles.modalBackdrop}>
          <form style={styles.lockDialog} onSubmit={lockWalletNow}>
            <h3 style={styles.lockDialogTitle}>Lock wallet now?</h3>
            <p style={styles.lockDialogText}>
              Your wallet will be frozen immediately, all sessions will be
              signed out, and a confirmation email will be sent.
            </p>
            <label htmlFor="lock-wallet-pin" style={styles.pinLabel}>
              PIN
            </label>
            <input
              id="lock-wallet-pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              maxLength={4}
              value={lockPin}
              onChange={(event) => setLockPin(event.target.value)}
              placeholder="Enter your PIN"
              required
              disabled={lockingWallet}
              style={styles.pinInput}
            />
            {lockError && <p style={styles.lockError}>{lockError}</p>}
            <div style={styles.lockDialogActions}>
              <button
                type="button"
                onClick={() => setLockDialogOpen(false)}
                disabled={lockingWallet}
                style={styles.cancelLockBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={lockingWallet || !lockPin.trim()}
                style={styles.confirmLockBtn}
              >
                {lockingWallet ? "Locking..." : "Lock wallet"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Profile;

// ================= STYLES =================
const styles = {
  page: {
    padding: "32px 28px",
    maxWidth: 640,
    margin: "0 auto",
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 4,
    fontSize: 14,
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: "28px",
    border: "1px solid #f3f4f6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  avatarSection: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #e5e7eb",
  },
  name: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
  },
  email: {
    margin: "4px 0 0",
    fontSize: 14,
    color: "#6b7280",
  },
  divider: {
    height: 1,
    background: "#f3f4f6",
    margin: "24px 0",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  infoLabel: {
    margin: 0,
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  infoValue: {
    margin: 0,
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
  },
  actions: {
    display: "flex",
    gap: 12,
    marginTop: 28,
  },
  primaryBtn: {
    background: "#2563eb",
    color: "white",
    padding: "10px 20px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
  },
  secondaryBtn: {
    background: "white",
    color: "#374151",
    padding: "10px 20px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
    border: "1px solid #d1d5db",
  },
  sectionTitle: {
    margin: "0 0 20px 0",
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
  },
  securityItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  securityInfo: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  securityIcon: {
    fontSize: 24,
  },
  securityTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
  },
  securityDesc: {
    margin: "3px 0 0",
    fontSize: 13,
    color: "#6b7280",
    maxWidth: 320,
  },
  lockWalletItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginTop: 24,
    paddingTop: 20,
    borderTop: "1px solid #f3f4f6",
  },
  lockWalletBtn: {
    padding: "9px 18px",
    borderRadius: 8,
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    background: "rgba(15, 23, 42, 0.55)",
  },
  lockDialog: {
    width: "100%",
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    background: "#ffffff",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
  },
  lockDialogTitle: {
    margin: 0,
    color: "#111827",
    fontSize: 20,
  },
  lockDialogText: {
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 1.5,
    margin: "10px 0 18px",
  },
  pinLabel: {
    display: "block",
    marginBottom: 6,
    color: "#374151",
    fontSize: 13,
    fontWeight: 600,
  },
  pinInput: {
    boxSizing: "border-box",
    width: "100%",
    padding: 12,
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 16,
  },
  lockError: {
    margin: "8px 0 0",
    color: "#b91c1c",
    fontSize: 13,
  },
  lockDialogActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  cancelLockBtn: {
    padding: "10px 16px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    background: "#ffffff",
    color: "#374151",
    cursor: "pointer",
  },
  confirmLockBtn: {
    padding: "10px 16px",
    border: "1px solid #b91c1c",
    borderRadius: 8,
    background: "#b91c1c",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },
  toggleBtn: {
    padding: "9px 18px",
    borderRadius: 8,
    border: "1px solid",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};