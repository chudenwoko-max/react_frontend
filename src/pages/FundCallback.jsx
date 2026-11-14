import { useEffect } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function FundCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && reference) {
      window.location.href = `payhost://fund/callback?reference=${encodeURIComponent(reference)}`;
      return;
    }

    if (!reference) {
      toast.error("No payment reference found");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
      return;
    }

    axiosClient
      .get("wallet/fund/verify/", { params: { reference } })
      .then(() => {
        toast.success("Wallet funded successfully");
        setTimeout(() => {
          window.location.replace("/dashboard");
        }, 1500);
      })
      .catch(() => {
        toast.error("Could not confirm payment");
        setTimeout(() => {
          window.location.href = "/fund-wallet";
        }, 2000);
      });
  }, []);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      Confirming payment…
    </div>
  );
}