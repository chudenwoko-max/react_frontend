import { useState } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

function FundWallet() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);

  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

  const handleFund = async () => {
  if (!amount || Number(amount) <= 0) {
    toast.error("Please enter a valid amount");
    return;
  }
  if (!method) {
    toast.error("Please select a payment method");
    return;
  }

  setLoading(true);

  try {
    const res = await axiosClient.post("/wallet/fund/", {
      amount: amount,
    });

    toast.success(res.data.message || `Successfully funded ₦${Number(amount).toLocaleString()}`);
    setAmount("");
    setMethod("");
  } catch (error) {
    console.error("Fund wallet error:", error);
    toast.error(error.response?.data?.error || "Funding failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Fund Wallet</h1>
        <p style={styles.subtitle}>Add money to your wallet securely</p>
      </div>

      <div style={styles.card}>
        {/* Amount Input */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Amount</label>
          <div style={styles.amountWrapper}>
            <span style={styles.currency}>₦</span>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.amountInput}
            />
          </div>
        </div>

        {/* Quick Amounts */}
        <div style={styles.quickGrid}>
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(amt.toString())}
              style={{
                ...styles.quickBtn,
                background: amount === amt.toString() ? "#eff6ff" : "#f9fafb",
                borderColor: amount === amt.toString() ? "#2563eb" : "#e5e7eb",
                color: amount === amt.toString() ? "#2563eb" : "#374151",
              }}
            >
              ₦{amt.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Payment Method */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Payment Method</label>

          <div style={styles.methodsGrid}>
            {[
              { value: "card", label: "Debit / Credit Card", icon: "💳" },
              { value: "bank", label: "Bank Transfer", icon: "🏦" },
              { value: "ussd", label: "USSD", icon: "📱" },
            ].map((item) => (
              <div
                key={item.value}
                onClick={() => setMethod(item.value)}
                style={{
                  ...styles.methodCard,
                  borderColor: method === item.value ? "#2563eb" : "#e5e7eb",
                  background: method === item.value ? "#eff6ff" : "white",
                }}
              >
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={styles.methodLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fund Button */}
        <button
          onClick={handleFund}
          disabled={loading}
          style={{
            ...styles.fundBtn,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Processing..." : "Fund Wallet"}
        </button>
      </div>
    </div>
  );
}

export default FundWallet;

// ================= STYLES =================
const styles = {
  page: {
    padding: "32px 28px",
    maxWidth: 520,
    margin: "0 auto",
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 4,
    fontSize: 14,
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: "28px",
    border: "1px solid #f3f4f6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 8,
  },
  amountWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #d1d5db",
    borderRadius: 12,
    overflow: "hidden",
  },
  currency: {
    padding: "14px 16px",
    background: "#f9fafb",
    fontWeight: 600,
    fontSize: 18,
    color: "#374151",
    borderRight: "1px solid #d1d5db",
  },
  amountInput: {
    flex: 1,
    padding: "14px 16px",
    border: "none",
    fontSize: 22,
    fontWeight: 700,
    outline: "none",
  },
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    marginBottom: 28,
  },
  quickBtn: {
    padding: "10px",
    borderRadius: 10,
    border: "1px solid",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    background: "#f9fafb",
  },
  methodsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  methodCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "14px 16px",
    borderRadius: 12,
    border: "1.5px solid #e5e7eb",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: "#111827",
  },
  fundBtn: {
    width: "100%",
    padding: "15px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
  },
};