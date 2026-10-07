import { useState } from "react";
import axiosClient from "../axiosClient";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  // PATCH: keep the user_id from the login response here. verify-2fa needs that id (the 9), not the username.
  const [userId, setUserId] = useState(null);
  const [show2FA, setShow2FA] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    // PATCH: stop the browser submitting the form as a navigation (GET /login).
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axiosClient.post("login/", { username, password });
      if (res.data.requires_2fa) {
        setUserId(res.data.user_id);
        setShow2FA(true);
        return;
      }
      // Web login sets cookies. Do not read access/refresh or write localStorage.
      setUser?.(res.data.user);
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    // PATCH: same preventDefault. Without it a type="submit" button reloads /login and verify-2fa never runs.
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axiosClient.post("verify-2fa/", {
        user_id: userId,
        code,
        device_fingerprint: localStorage.getItem("device_fingerprint") || "",
      });
      setUser?.(res.data.user);
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  if (show2FA) {
    return (
      <form onSubmit={handleVerify}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Verification code"
        />
        {error ? <p>{error}</p> : null}
        {/* PATCH: type="button" plus onClick, so Enter still uses onSubmit/preventDefault and a click cannot navigate. */}
        <button type="submit" disabled={loading || !userId}>
          {loading ? "Checking..." : "Verify"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error ? <p>{error}</p> : null}
      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}