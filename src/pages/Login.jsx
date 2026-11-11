import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [username, setUsername] = useState(
    () => localStorage.getItem("payhost_username") || ""
  );
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [totpCode, setTotpCode] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || passcode.length !== 6) {
      toast.error("Enter username and 6-digit passcode");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosClient.post("login/", {
        username: username.trim(),
        passcode,
      });

      // 2FA required
      if (res.data?.requires_2fa) {
        setTempToken(res.data.temp_token);
        setRequires2FA(true);
        setLoading(false);
        return;
      }

      // Normal login
      localStorage.setItem("payhost_username", username.trim());
      if (res.data?.user) {
        setUser(res.data.user);
      }
      toast.success("Welcome back");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    if (totpCode.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosClient.post("login/2fa/", {
        temp_token: tempToken,
        code: totpCode,
      });
      localStorage.setItem("payhost_username", username.trim());
      if (res.data?.user) {
        setUser(res.data.user);
      }
      toast.success("Welcome back");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const useDifferentAccount = () => {
    localStorage.removeItem("payhost_username");
    setUsername("");
    setPasscode("");
    setRequires2FA(false);
    setTempToken("");
    setTotpCode("");
  };

  if (requires2FA) {
    return (
      <div style={styles.page}>
        <form onSubmit={handle2FA} style={styles.card}>
          <h1 style={styles.title}>Two-factor authentication</h1>
          <p style={{ textAlign: "center", color: "#6b7280", marginTop: 0, marginBottom: 20 }}>
            Enter the 6-digit code from your authenticator app
          </p>

          <label style={styles.label}>Authentication code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
            placeholder="••••••"
            style={styles.input}
            autoFocus
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Verifying..." : "Verify"}
          </button>

          <button
            type="button"
            onClick={() => {
              setRequires2FA(false);
              setTotpCode("");
            }}
            style={{ ...styles.switchAccount, marginTop: 16, width: "100%", textAlign: "center" }}
          >
            Back to login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h1 style={styles.title}>Sign in</h1>

        <label style={styles.label}>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={!!localStorage.getItem("payhost_username")}
          style={styles.input}
          autoComplete="username"
        />

        {!!localStorage.getItem("payhost_username") && (
          <button
            type="button"
            onClick={useDifferentAccount}
            style={styles.switchAccount}
          >
            Use a different account
          </button>
        )}

        <label style={styles.label}>Passcode</label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={passcode}
          onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ""))}
          placeholder="••••••"
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p style={styles.linkRow}>
          <Link to="/forgot-passcode">Forgot passcode?</Link>
        </p>

        <p style={styles.linkRow}>
          Don't have an account? <Link to="/register">Create Account</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" },
  card: { background: "#fff", padding: 32, borderRadius: 16, width: "100%", maxWidth: 380, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" },
  title: { margin: "0 0 24px", fontSize: 24, textAlign: "center" },
  label: { display: "block", fontSize: 13, marginBottom: 6, color: "#374151" },
  input: { width: "100%", padding: "12px 14px", marginBottom: 16, borderRadius: 10, border: "1px solid #d1d5db", fontSize: 16, boxSizing: "border-box" },
  switchAccount: {
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: 14,
    cursor: "pointer",
    textAlign: "left",
    padding: "4px 0 12px",
    textDecoration: "underline",
  },
  button: { width: "100%", padding: 13, background: "#0F172A", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" },
  linkRow: { textAlign: "center", marginTop: 16, fontSize: 14 },
};