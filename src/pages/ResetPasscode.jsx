import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function ResetPasscode() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [passcode, setPasscode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passcode !== confirm) {
      toast.error("Passcodes do not match");
      return;
    }
    if (!/^\d{6}$/.test(passcode)) {
      toast.error("Passcode must be exactly 6 digits");
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post("passcode-reset/confirm/", {
        token,
        new_passcode: passcode,
      });
      toast.success("Passcode reset successfully");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Invalid link</h1>
          <p style={styles.subtitle}>This reset link is missing or invalid.</p>
          <p style={styles.footer}>
            <Link to="/forgot-passcode" style={styles.link}>Request a new link</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Set new passcode</h1>
        <p style={styles.subtitle}>Enter a new 6-digit login passcode.</p>

        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={passcode}
          onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ""))}
          placeholder="New passcode"
          required
          style={styles.input}
        />
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ""))}
          placeholder="Confirm passcode"
          required
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Saving…" : "Reset passcode"}
        </button>

        <p style={styles.footer}>
          <Link to="/login" style={styles.link}>Back to Sign in</Link>
        </p>
      </form>
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
    maxWidth: 400,
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 8px",
  },
  subtitle: {
    color: "#64748b",
    fontSize: 14,
    margin: "0 0 20px",
    lineHeight: 1.5,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    margin: "0 0 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 15,
    boxSizing: "border-box",
    letterSpacing: "0.2em",
    textAlign: "center",
  },
  button: {
    width: "100%",
    padding: "12px 16px",
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    marginTop: 8,
  },
  footer: {
    textAlign: "center",
    marginTop: 24,
    marginBottom: 0,
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 500,
  },
};