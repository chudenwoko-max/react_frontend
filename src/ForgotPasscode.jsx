import { useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

export default function ForgotPasscode() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.post("passcode-reset/request/", { username: username.trim() });
      setSent(true);
      toast.success("If the account exists, a reset link has been sent");
    } catch (err) {
      toast.error(err.response?.data?.error || "Unable to send reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 32, borderRadius: 16, width: 380 }}>
        <h1>Forgot passcode?</h1>
        <p>Enter your username. We’ll send a reset link to the linked email.</p>
        {!sent ? (
          <>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              style={{ width: "100%", padding: 12, margin: "12px 0", borderRadius: 8, border: "1px solid #d1d5db" }}
            />
            <button type="submit" disabled={loading} style={{ width: "100%", padding: 12, background: "#0F172A", color: "#fff", border: "none", borderRadius: 8 }}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </>
        ) : (
          <p style={{ color: "#166534" }}>Check your email for the reset link.</p>
        )}
        <p style={{ textAlign: "center", marginTop: 20 }}>
          <Link to="/login">Back to Sign in</Link>
        </p>
      </form>
    </div>
  );
}