import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [passcode, setPasscode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    // optional: focus first box when page loads
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fullPasscode.length !== 6) {
      toast.error("Enter a 6-digit passcode");
      return;
    }

    setLoading(true);

    try {
      await axiosClient.post("/register/", {
        ...formData,
        passcode: fullPasscode,
      }, {
        headers: {
          "X-Payhost-Client": "web",
        },
      });
      toast.success("Account created! You can now sign in.");
      navigate("/login");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Registration failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <img
            src="/payhost-mark.png"
            alt="Payhost"
            style={{ height: 96, width: "auto", display: "block", margin: "0 auto 16px" }}
          />
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join Payhost and start sending money instantly</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>6-digit passcode</label>
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
          </div>

          <button type="submit" style={styles.button} disabled={loading || fullPasscode.length !== 6}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
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
    background: "#f3f4f6",
    padding: "20px",
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: "36px 32px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid #f3f4f6",
  },
  header: {
    marginBottom: 28,
    textAlign: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 8,
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 18,
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
    boxSizing: "border-box",
  },
  passcodeContainer: {
    display: "flex",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
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
  button: {
    width: "100%",
    padding: "14px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 10,
  },
  footerText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
    color: "#6b7280",
  },
  link: {
    color: "#2563eb",
    fontWeight: 500,
    textDecoration: "none",
  },
};