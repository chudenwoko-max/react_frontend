import { useEffect } from "react";

export default function PaymentDone() {
  useEffect(() => {
    // Only try to open the app. Do not redirect to a protected route.
    window.location.href = "payhost://fund/callback";
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "serif",
        fontSize: 18,
        color: "#475569",
        background: "#f8fafc",
        margin: 0,
        textAlign: "center",
        padding: 24,
      }}
    >
      Confirming payment...
      <br />
      <span style={{ fontSize: 14, marginTop: 12, display: "block" }}>
        If the app didn’t open, you can close this tab and return to Payhost.
      </span>
    </div>
  );
}