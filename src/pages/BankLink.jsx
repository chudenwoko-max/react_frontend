import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import Skeleton from "../components/Skeleton";

export default function BankLink() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    setLoading(true);

    axiosClient
      .get("bank/account/")
      .then((res) => {
        if (res.data.message === "No bank account linked") {
          setAccount(null);
        } else {
          setAccount(res.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setAccount(null);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2>Bank Account Linking</h2>

      {/* ⭐ Loading skeleton */}
      {loading && (
        <div style={{ marginTop: "20px" }}>
          <Skeleton height="20px" width="60%" />
          <Skeleton height="20px" width="40%" />
          <Skeleton height="20px" width="50%" />
        </div>
      )}

      {/* ⭐ No bank account */}
      {!loading && !account && (
        <p style={{ marginTop: "20px" }}>No bank account linked yet.</p>
      )}

      {/* ⭐ Bank account exists */}
      {!loading && account && (
        <div style={{ marginTop: "20px" }}>
          <p><strong>Bank Name:</strong> {account.bank_name}</p>
          <p><strong>Account Number:</strong> {account.account_number}</p>
          <p><strong>Account Name:</strong> {account.account_name}</p>
        </div>
      )}
    </div>
  );
}
