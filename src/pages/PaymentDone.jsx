import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentDone() {
  const navigate = useNavigate();

  useEffect(() => {
    // Try to open the mobile app
    const deepLink = "payhost://fund/callback";
    window.location.href = deepLink;

    // If still on the page after 1.5s, user is on web → go to dashboard
    const timer = setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

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