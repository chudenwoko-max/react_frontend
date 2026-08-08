import { useState } from "react";
import axiosClient from "../axiosClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState(null);
  const [debugOtp, setDebugOtp] = useState("");

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      toast.error("Please enter username and password");
      return;
    }

    setLoading(true);

    try {
      const res = await axiosClient.post("/2fa/login/", {
        username: username.trim(),
        password,
      });

      if (res.data.requires_2fa) {
        setRequires2FA(true);
        setUserId(res.data.user_id);
        setDebugOtp(res.data.debug_otp || "");
        toast.success("OTP sent. Please enter the code.");
      } else {
        localStorage.setItem("ACCESS_TOKEN", res.data.access);
        localStorage.setItem("REFRESH_TOKEN", res.data.refresh);
        setUser(res.data.user);
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.log("FULL ERROR RESPONSE:", err.response?.data);
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await axiosClient.post("/2fa/verify/", {
        user_id: userId,
        code: otp,
      });

      localStorage.setItem("ACCESS_TOKEN", res.data.access);
      localStorage.setItem("REFRESH_TOKEN", res.data.refresh);
      setUser(res.data.user);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brandSection}>
          <img
            src="/orbitpay-logo.png"
            alt="OrbitPay"
            style={styles.logo}
          />
          <p style={styles.tagline}>
            {requires2FA ? "Enter Verification Code" : "Sign in to your account"}
          </p>
        </div>

        {!requires2FA ? (
          <form onSubmit={handleLogin}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username or Email</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <p style={styles.infoText}>
              A 6-digit code has been sent. Enter it below to continue.
            </p>

            {debugOtp && (
              <p style={styles.debugText}>
                Debug OTP: <strong>{debugOtp}</strong>
              </p>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Verification Code</label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Verifying..." : "Verify & Login"}
            </button>

            <button
              type="button"
              onClick={() => {
                setRequires2FA(false);
                setOtp("");
              }}
              style={styles.backBtn}
            >
              ← Back to Login
            </button>
          </form>
        )}

        {!requires2FA && (
          <p style={styles.footerText}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.link}>
              Create Account
            </Link>
          </p>
        )}
      </div>
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
    padding: "20px",
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
  brandSection: {
    textAlign: "center",
    marginBottom: 32,
  },
  logo: {
    height: 52,
    marginBottom: 12,
    objectFit: "contain",
  },
  tagline: {
    color: "#6b7280",
    marginTop: 8,
    fontSize: 15,
  },
  formGroup: {
    marginBottom: 20,
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
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 15,
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "13px",
    background: "#0F172A", // Navy primary
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
  },
  backBtn: {
    width: "100%",
    padding: "12px",
    background: "transparent",
    color: "#6b7280",
    border: "none",
    fontSize: 14,
    cursor: "pointer",
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 16,
    textAlign: "center",
  },
  debugText: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "10px",
    borderRadius: 8,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  footerText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
    color: "#6b7280",
  },
  link: {
    color: "#0F172A",
    fontWeight: 500,
    textDecoration: "none",
  },
};