import { useEffect } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function MerchantCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");

    if (!reference) {
      toast.error("No payment reference found");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
      return;
    }

    axiosClient
      .post("merchant/pay/verify/", { reference })
      .then(() => {
        toast.success("Payment successful");
        setTimeout(() => {
          window.location.replace("/dashboard");
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response?.data?.error || "Payment verification failed");
        setTimeout(() => {
          window.location.href = "/pay";
        }, 2000);
      });
  }, []);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <p>Verifying payment…</p>
    </div>
  );
}