import { useEffect } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function FundCallback() {
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const reference = params.get("reference") || params.get("trxref");

  console.log("CALLBACK", { reference, href: window.location.href });

  if (!reference) {
    toast.error("No payment reference found");
    setTimeout(() => window.location.replace("/dashboard"), 1500);
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  axiosClient
    .get("wallet/fund/verify/", {
      params: { reference },
      signal: controller.signal,
    })
    .then(() => {
      toast.success("Wallet funded successfully");
    })
    .catch((err) => {
      console.log("VERIFY ERROR", err.response?.data || err.message);
      toast.error("Could not confirm payment — check your balance");
    })
    .finally(() => {
      clearTimeout(timeout);
      setTimeout(() => window.location.replace("/dashboard"), 1500);
    });
}, []);

  // Blank for mobile, normal message only for desktop
  return (
    <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
      Confirming payment…
    </div>
  );
}