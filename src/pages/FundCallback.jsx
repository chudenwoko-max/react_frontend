import { useEffect } from "react";

export default function PaymentDone() {
  useEffect(() => {
    // This triggers the “Open Payhost” dialog you photographed
    window.location.href = "payhost://fund/callback";
  }, []);

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "serif",
      fontSize: 18,
      color: "#475569",
      background: "#f8fafc"
    }}>
      Confirming payment...
    </div>
  );
}