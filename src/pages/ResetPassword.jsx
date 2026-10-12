import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("This reset link is missing a token.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axiosClient.post("password-reset/confirm/", {
        token,
        new_password: password,
        confirm_password: confirm,
      });
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.error || "Reset failed. Request a new link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <h1>Reset password</h1>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
      <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" />
      {error ? <p>{error}</p> : null}
      <button disabled={loading}>{loading ? "Saving" : "Set password"}</button>
    </form>
  );
}