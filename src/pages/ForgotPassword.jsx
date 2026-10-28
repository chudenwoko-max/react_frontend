import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axiosClient from "../axiosClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email or username.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await axiosClient.post("password-reset/request/", {
        email: email.trim(),
      });
      setSuccess(true);
      toast.success("If an account exists, a reset link has been sent.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error || "Unable to send a reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <main style={styles.card}>
        <h1 style={styles.title}>Forgot password?</h1>
        <p style={styles.description}>
          Enter your email or username and we’ll send you a reset link.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="account" style={styles.label}>
            Email or Username
          </label>
          <input
            id="account"
            type="text"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={styles.input}
          />
          {error && <p role="alert" style={styles.error}>{error}</p>}
          {success && (
            <p role="status" style={styles.success}>
              If an account exists, a reset link has been sent.
            </p>
          )}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <p style={styles.backLink}>
          <Link to="/login" style={styles.link}>Back to Login</Link>
        </p>
      </main>
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
    padding: 20,
  },
  card: {
    background: "#ffffff",
    width: "100%",
    maxWidth: 420,
    padding: "40px 36px",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  },
  title: {
    margin: "0 0 8px",
    color: "#0F172A",
    fontSize: 24,
  },
  description: {
    margin: "0 0 28px",
    color: "#64748B",
    fontSize: 15,
    lineHeight: 1.5,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 15,
    marginBottom: 16,
  },
  error: {
    color: "#b91c1c",
    fontSize: 14,
  },
  success: {
    color: "#166534",
    fontSize: 14,
  },
  button: {
    width: "100%",
    padding: 13,
    background: "#0F172A",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  backLink: {
    margin: "20px 0 0",
    textAlign: "center",
    fontSize: 14,
  },
  link: {
    color: "#0284C7",
    textDecoration: "none",
  },
};
