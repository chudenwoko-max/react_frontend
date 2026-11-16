import { useEffect } from "react";

export default function PaymentDone() {
  useEffect(() => {
    // Attempt to open the app. Cancel leaves the user on this page.
    // Open launches the app → fund/callback → dashboard.
    window.location.href = "payhost://fund/callback";
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "serif",
        background: "#f8fafc",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>
        Payment Successful
      </h1>
      <p style={{ color: "#64748b", marginTop: 12, fontSize: 16 }}>
        Confirming payment...
      </p>
      <p style={{ color: "#94a3b8", marginTop: 24, fontSize: 14, maxWidth: 320 }}>
        If the app didn’t open, you can close this tab and return to Payhost.
      </p>
    </div>
  );
}