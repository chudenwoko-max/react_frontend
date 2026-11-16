import { useEffect } from "react";

export default function PaymentDone() {
  useEffect(() => {
    // Trigger the “Open Payhost” dialog
    const deepLink = "payhost://fund/callback";
    window.location.href = deepLink;

    // Optional fallback: if the app doesn’t open, user can still close the tab
    const timer = setTimeout(() => {
      // You can leave this empty or show a message
    }, 2000);

    return () => clearTimeout(timer);
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
      }}
    >
      Confirming payment...
    </div>
  );
}