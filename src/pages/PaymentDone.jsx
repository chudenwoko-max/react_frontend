import { useEffect } from "react";

export default function PaymentDone() {
  useEffect(() => {
    // Try mobile deep link first
    const deepLink = "payhost://fund/callback";
    window.location.href = deepLink;

    // Web fallback → dashboard
    const timer = setTimeout(() => {
      window.location.replace("/dashboard");
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "serif",
        fontSize: 18,
        color: "#475569",
        background: "#f8fafc",
        margin: 0,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
      <div>Payment Successful</div>
      <div style={{ marginTop: 12, fontSize: 16, color: "#64748b" }}>
        Redirecting to dashboard...
      </div>
    </div>
  );
}