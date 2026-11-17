import { useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function ForgotPasscode() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.post("passcode-reset/request/", { username: username.trim() });
      setSent(true);
      toast.success("If the account exists, a reset link has been sent");
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || "Unable to send reset";
      toast.error(msg);
      console.error("Passcode reset error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!username.trim()) return;
    setLoading(true);
    try {
      await axiosClient.post("passcode-reset/request/", { username: username.trim() });
      toast.success("Reset link sent again");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not resend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Forgot passcode?</h1>
        <p style={styles.subtitle}>
          Enter your username. We’ll send a reset link to the linked email.
        </p>

        {!sent ? (
          <>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              autoFocus
              style={styles.input}
            />
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </>
        ) : (
          <div style={styles.successBox}>
            <p style={styles.successText}>Check your email for the reset link.</p>
            <p style={styles.hint}>It may take a minute. Check spam if you don’t see it.</p>

            <button
              type="button"
              onClick={resend}
              disabled={loading}
              style={{ ...styles.button, background: "#334155", marginTop: 12 }}
            >
              {loading ? "Sending…" : "Resend email"}
            </button>

            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              style={styles.linkButton}
            >
              Email not received?
            </button>

            {showHelp && (
              <div style={styles.helpBox}>
                <p style={{ margin: "0 0 8px", fontSize: 13 }}>
                  • Check your spam/junk folder<br />
                  • Make sure the username is correct<br />
                  • Wait 1–2 minutes and try Resend<br />
                  • Still nothing? Contact support from the login page
                </p>
              </div>
            )}
          </div>
        )}

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
    margin: "0 0 16px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 15,
    boxSizing: "border-box",
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
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    marginTop: 12,
    padding: 0,
  },
  successBox: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 8,
    padding: "16px",
  },
  successText: {
    color: "#166534",
    margin: 0,
    fontWeight: 500,
  },
  hint: {
    color: "#4b5563",
    fontSize: 13,
    margin: "6px 0 0",
  },
  helpBox: {
    marginTop: 12,
    padding: 12,
    background: "#f8fafc",
    borderRadius: 6,
    border: "1px solid #e2e8f0",
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