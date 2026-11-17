import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

function getOrCreateDeviceId() {
  let id = localStorage.getItem("payhost_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("payhost_device_id", id);
  }
  return id;
}

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [passcode, setPasscode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [showFreeze, setShowFreeze] = useState(false);
  const [freezeEmail, setFreezeEmail] = useState("");
  const [freezeLoading, setFreezeLoading] = useState(false);

  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [totpCode, setTotpCode] = useState("");

  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handlePasscodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPasscode = [...passcode];
    newPasscode[index] = value.slice(-1);
    setPasscode(newPasscode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !passcode[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newPasscode = [...passcode];
    for (let i = 0; i < 6; i++) {
      newPasscode[i] = pasted[i] || "";
    }
    setPasscode(newPasscode);
    const nextIndex = Math.min(pasted.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  const fullPasscode = passcode.join("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (fullPasscode.length !== 6) {
      toast.error("Enter your 6-digit passcode");
      return;
    }
    setLoading(true);
    try {
      const deviceId = getOrCreateDeviceId();
      const res = await axiosClient.post("login/", {
        passcode: fullPasscode,
        device_id: deviceId,
        device_fingerprint: deviceId,
      });

      if (res.data?.requires_2fa) {
        setTempToken(res.data.temp_token);
        setRequires2FA(true);
        setLoading(false);
        return;
      }

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

  const handleFreezeRequest = async (e) => {
    e.preventDefault();
    const email = freezeEmail.trim();
    if (!email) {
      toast.error("Enter your account email");
      return;
    }

    setFreezeLoading(true);
    try {
      await axiosClient.post("security/request-freeze/", { email });
      toast.success(
        "If the account exists, a freeze link has been sent to your email."
      );
      setFreezeEmail("");
      setShowFreeze(false);
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Could not send the freeze link. Please try again."
      );
    } finally {
      setFreezeLoading(false);
    }
  };

  if (requires2FA) {
    return (
      <div style={styles.page}>
        <form onSubmit={handle2FA} style={styles.card}>
          <div style={styles.logoWrap}>
            <img src="/payhost-mark.png" alt="PayHost" style={styles.logo} />
          </div>
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
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <img src="/payhost-mark.png" alt="PayHost" style={styles.logo} />
        </div>

        <form onSubmit={handleLogin}>
          <h1 style={styles.title}>Sign in</h1>
          <p style={styles.subtitle}>Enter your 6-digit passcode</p>

          <div style={styles.passcodeContainer} onPaste={handlePaste}>
            {passcode.map((digit, index) => (
              <div key={index} style={styles.passcodeBox}>
                <span style={styles.dot}>{digit ? "•" : ""}</span>
                <input
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePasscodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  style={styles.hiddenInput}
                  autoComplete="off"
                />
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading || fullPasscode.length !== 6} style={styles.button}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p style={styles.linkRow}>
            <Link to="/forgot-passcode">Forgot passcode?</Link>
          </p>

          <p style={styles.linkRow}>
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </form>

        {showFreeze && (
          <form
            id="freeze-request-form"
            onSubmit={handleFreezeRequest}
            style={styles.freezeForm}
          >
            <label htmlFor="freeze-email" style={styles.label}>
              Account email
            </label>
            <input
              id="freeze-email"
              type="email"
              autoComplete="email"
              required
              value={freezeEmail}
              onChange={(e) => setFreezeEmail(e.target.value)}
              style={styles.input}
            />
            <button type="submit" disabled={freezeLoading} style={styles.button}>
              {freezeLoading ? "Sending..." : "Send freeze link"}
            </button>
          </form>
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
    padding: 16,
  },
  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 16,
    width: "100%",
    maxWidth: 340,
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  },
  logoWrap: { display: "flex", justifyContent: "center", marginBottom: 8 },
  logo: { height: 44, width: "auto" },
  title: { margin: "0 0 6px", fontSize: 22, textAlign: "center" },
  subtitle: { textAlign: "center", color: "#6b7280", margin: "0 0 18px", fontSize: 14 },
  label: { display: "block", fontSize: 13, marginBottom: 6, color: "#374151" },
  input: {
    width: "100%",
    padding: "12px 14px",
    marginBottom: 16,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 16,
    boxSizing: "border-box",
  },
  passcodeContainer: {
    display: "flex",
    justifyContent: "center",
    gap: 6,
    marginBottom: 18,
  },
  passcodeBox: {
    width: 36,
    height: 44,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid #d1d5db",
    borderRadius: 8,
    background: "#fff",
  },
  dot: {
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
    pointerEvents: "none",
    lineHeight: 1,
  },
  hiddenInput: {
    position: "absolute",
    inset: 0,
    opacity: 0,
    width: "100%",
    height: "100%",
    border: "none",
    background: "transparent",
    caretColor: "transparent",
    fontSize: 16,
  },
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
  button: {
    width: "100%",
    padding: 13,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
  },
  linkRow: { textAlign: "center", marginTop: 14, fontSize: 14 },
  freezeForm: { marginTop: 20 },
};