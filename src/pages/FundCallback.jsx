// pages/payment-done.tsx  (or equivalent)
import { useEffect } from "react";

export default function PaymentDone() {
  useEffect(() => {
    // Try to open the app
    const deepLink = "payhost://fund/callback";
    window.location.href = deepLink;

    // Fallback: if the app doesn't open after 1.5s, stay on web or redirect
    const timer = setTimeout(() => {
      // optional: window.location.href = "/dashboard";
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ 
      display: "flex", 
      height: "100vh", 
      alignItems: "center", 
      justifyContent: "center",
      fontFamily: "serif",
      fontSize: 18,
      color: "#475569"
    }}>
      Confirming payment...
    </div>
  );
}