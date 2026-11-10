import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function Referral() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyCode, setApplyCode] = useState("");
  const [applying, setApplying] = useState(false);

  const fetchReferral = async () => {
    try {
      const res = await axiosClient.get("/referral/");
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Could not load referral info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferral();
  }, []);

  const copyCode = () => {
    if (!data?.code) return;
    navigator.clipboard.writeText(data.code);
    toast.success("Referral code copied");
  };

  const copyMessage = () => {
    if (!data?.share_message) return;
    navigator.clipboard.writeText(data.share_message);
    toast.success("Invite message copied");
  };

  const handleApplyCode = async () => {
    if (!applyCode.trim()) {
      toast.error("Enter a referral code");
      return;
    }

    setApplying(true);
    try {
      await axiosClient.post("/referral/apply/", { code: applyCode.trim() });
      toast.success("Referral code applied");
      setApplyCode("");
      fetchReferral();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to apply code");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Refer friends</h1>
        <p style={styles.subtitle}>
          Share Payhost with people you know
        </p>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>People referred</p>
          <h2 style={styles.statValue}>{data?.total_referrals || 0}</h2>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Your referral code</h3>
        <div style={styles.codeBox}>
          <span style={styles.code}>{data?.code || "—"}</span>
          <button onClick={copyCode} style={styles.copyBtn}>
            Copy
          </button>
        </div>

        <p style={styles.shareLabel}>Invite message</p>
        <div style={styles.messageBox}>
          <p style={styles.message}>
            {data?.share_message || "Join me on Payhost."}
          </p>
          <button onClick={copyMessage} style={styles.copyBtn}>
            Copy message
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Have a referral code?</h3>
        <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 16px" }}>
          Enter a code from someone who invited you
        </p>
        <div style={styles.applyRow}>
          <input
            type="text"
            placeholder="Referral code"
            value={applyCode}
            onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
            style={styles.input}
            autoCapitalize="characters"
          />
          <button
            onClick={handleApplyCode}
            disabled={applying}
            style={styles.applyBtn}
          >
            {applying ? "Applying…" : "Apply"}
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>People you’ve referred</h3>

        {!data?.referrals?.length ? (
          <p style={styles.empty}>No referrals yet</p>
        ) : (
          <div style={styles.list}>
            {data.referrals.map((ref) => (
              <div key={ref.id} style={styles.listItem}>
                <div>
                  <p style={styles.username}>{ref.username}</p>
                  <p style={styles.date}>{ref.created_at}</p>
                </div>
                <span
                  style={{
                    ...styles.badge,
                    background: ref.status === "completed" ? "#dcfce7" : "#f3f4f6",
                    color: ref.status === "completed" ? "#16a34a" : "#6b7280",
                  }}
                >
                  {ref.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: "white",
    padding: "20px",
    borderRadius: 14,
    border: "1px solid #f3f4f6",
    textAlign: "center",
  },
  statLabel: {
    margin: 0,
    fontSize: 13,
    color: "#6b7280",
  },
  statValue: {
    margin: "8px 0 0",
    fontSize: 26,
    fontWeight: 700,
    color: "#111827",
  },
  card: {
    background: "white",
    borderRadius: 16,
    padding: "24px",
    border: "1px solid #f3f4f6",
    marginBottom: 20,
  },
  cardTitle: {
    margin: "0 0 16px 0",
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
  },
  codeBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#f0f9ff",
    padding: "14px 18px",
    borderRadius: 12,
    marginBottom: 20,
  },
  code: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 2,
    color: "#1e40af",
  },
  copyBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  shareLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
  },
  messageBox: {
    background: "#f9fafb",
    padding: "14px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
  },
  message: {
    margin: "0 0 12px 0",
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.5,
  },
  applyRow: {
    display: "flex",
    gap: 10,
  },
  input: {
    flex: 1,
    padding: "11px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  },
  applyBtn: {
    padding: "11px 20px",
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  username: {
    margin: 0,
    fontWeight: 600,
    fontSize: 14,
  },
  date: {
    margin: "3px 0 0",
    fontSize: 12,
    color: "#9ca3af",
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  empty: {
    textAlign: "center",
    color: "#9ca3af",
    padding: "20px 0",
  },
};