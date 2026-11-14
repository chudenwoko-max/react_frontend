import { useEffect, useRef, useState } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function FreezeConfirm() {
  const [status, setStatus] = useState("Confirming account freeze...");
  const submittedToken = useRef("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("This freeze link is missing a token.");
      return;
    }

    if (submittedToken.current === token) return;
    submittedToken.current = token;

    axiosClient
      .post("security/confirm-freeze/", { token })
      .then(() => {
        toast.success("Account frozen. All devices signed out.");
        setStatus("Account frozen. All devices signed out.");
      })
      .catch(() => {
        toast.error("Invalid or expired link");
        setStatus("This freeze link is invalid or has expired.");
      });
  }, []);

  return (
    <main style={styles.page}>
      <section style={styles.card} aria-live="polite">
        <h1 style={styles.title}>Freeze account</h1>
        <p style={styles.status}>{status}</p>
      </section>
    </main>
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
    width: "100%",
    maxWidth: 420,
    padding: 36,
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    textAlign: "center",
  },
  title: { margin: "0 0 12px", color: "#0f172a", fontSize: 24 },
  status: { margin: 0, color: "#64748b", lineHeight: 1.5 },
};
