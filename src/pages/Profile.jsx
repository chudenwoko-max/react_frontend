import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../axiosClient";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);

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
      </div>
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