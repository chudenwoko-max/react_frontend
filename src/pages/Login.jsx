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
  const [username, setUsername] = useState("");
  const [showUsername, setShowUsername] = useState(false);
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
    if (showUsername && !username.trim()) {
      toast.error("Enter your username");
      return;
    }

    setLoading(true);
    try {
      const deviceId = getOrCreateDeviceId();
      const payload = {
        passcode: fullPasscode,
        device_id: deviceId,
        device_fingerprint: deviceId,
      };
      if (showUsername) {
        payload.username = username.trim();
      }

      const res = await axiosClient.post("login/", payload);

      if (res.data?.requires_2fa) {
        setTempToken(res.data.temp_token);
        setRequires2FA(true);
        return;
      }

      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem("payhost_username", res.data.user.username);
        navigate("/dashboard");
      }
    } catch (err) {
  const errorMsg = err.response?.data?.error || "Login failed";

  // New device → show username field
  if (
    errorMsg.toLowerCase().includes("username required") &&
    !showUsername
  ) {
    setShowUsername(true);
    toast("First time on this device — enter your username", { icon: "ℹ️" });
  } else {
    toast.error(errorMsg);
  }
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
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  if (requires2FA) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Two-factor authentication</h1>
          <p style={styles.subtitle}>Enter the 6-digit code from your authenticator app</p>
          <form onSubmit={handle2FA}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              style={styles.input}
              autoFocus
            />
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <img src="/payhost-logo.png" alt="Payhost" style={styles.logo} />
        </div>
        <h1 style={styles.title}>Sign in</h1>
        <p style={styles.subtitle}>
          {showUsername ? "Enter username and passcode" : "Enter your 6-digit passcode"}
        </p>

        <form onSubmit={handleLogin}>
          {showUsername && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              autoFocus
              required
            />
          )}

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
  },
  card: {
    background: "#fff",
    padding: 32,
    borderRadius: 16,
    width: "100%",
    maxWidth: 380,
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  },
  logoWrap: { display: "flex", justifyContent: "center", marginBottom: 8 },
  logo: { height: 48, width: "auto" },
  title: { margin: "0 0 8px", fontSize: 24, textAlign: "center" },
  subtitle: { textAlign: "center", color: "#6b7280", margin: "0 0 24px", fontSize: 14 },
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
    fontSize: 20,
    fontWeight: 600,
    color: "#111827",
    pointerEvents: "none",
  },
  hiddenInput: {
    position: "absolute",
    inset: 0,
    opacity: 0,
    width: "100%",
    height: "100%",
    border: "none",
    background: "transparent",
    fontSize: 16,
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
  linkRow: { textAlign: "center", marginTop: 16, fontSize: 14 },
};