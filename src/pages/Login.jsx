import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill username after first login
  useEffect(() => {
    const saved = localStorage.getItem("payhost_username");
    if (saved) setUsername(saved);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || passcode.length !== 6) {
      toast.error("Enter username and 6-digit passcode");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosClient.post("login/", {
        username: username.trim(),
        passcode,
      });
      localStorage.setItem("payhost_username", username.trim());
      // store tokens / user as you already do
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

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
  button: { width: "100%", padding: 13, background: "#0F172A", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" },
  linkRow: { textAlign: "center", marginTop: 16, fontSize: 14 },
};