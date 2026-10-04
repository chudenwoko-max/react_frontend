import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";
import PinModal from "../components/PinModal";

export default function Withdraw() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

  const handleWithdraw = () => {
    if (loading) return;
    if (method !== "bank") {
      toast.error("Only bank transfer is available");
      return;
    }
    if (!amount || Number(amount) < 100) {
      toast.error("Minimum withdraw is ₦100");
      return;
    }
    setShowPin(true);
  };

  const handlePinVerified = async (pin) => {
    setLoading(true);
    try {
      const pinRes = await axiosClient.post("verify-pin/", { pin });
      const pinToken = pinRes.data.pin_token || pinRes.data.token;
      if (!pinToken) {
        toast.error("PIN token missing");
        setLoading(false);
        return;
      }
      await axiosClient.post("wallet/withdraw/", {
        amount,
        pin,
        pin_token: pinToken,
      });
      toast.success("Withdrawal submitted");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.error || "Withdrawal failed");
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Withdraw</h1>
        <p style={styles.subtitle}>Cash out to your linked bank account</p>
      </div>

      <div style={styles.card}>
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

        <div style={styles.quickGrid}>
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(amt.toString())}
              style={{
                ...styles.quickBtn,
                background: amount === amt.toString() ? "#fef2f2" : "#f9fafb",
                borderColor: amount === amt.toString() ? "#ef4444" : "#e5e7eb",
                color: amount === amt.toString() ? "#dc2626" : "#374151",
              }}
            >
              ₦{amt.toLocaleString()}
            </button>
          ))}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Withdrawal Method</label>
          <div style={styles.methodsGrid}>
            {[
              { value: "bank", label: "Bank Transfer", icon: "🏦" },
              { value: "mobile", label: "Mobile Money", icon: "📱" },
              { value: "agent", label: "Agent Withdrawal", icon: "🏪" },
            ].map((item) => (
              <div
                key={item.value}
                onClick={() => setMethod(item.value)}
                style={{
                  ...styles.methodCard,
                  borderColor: method === item.value ? "#ef4444" : "#e5e7eb",
                  background: method === item.value ? "#fef2f2" : "white",
                }}
              >
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={styles.methodLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.infoBox}>
          <p style={{ margin: 0, fontSize: 13, color: "#92400e" }}>
            Bank transfer uses your linked account. Paystack Starter cannot pay out yet, so a submitted withdraw may return to your wallet.
          </p>
        </div>

        <button onClick={handleWithdraw} disabled={loading} style={{ ...styles.withdrawBtn, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Processing..." : "Withdraw Funds"}
        </button>
      </div>

      <PinModal
        open={showPin}
        onClose={() => setShowPin(false)}
        onVerified={handlePinVerified}
        mode="verify"
      />
    </div>
  );
}

const styles = {
  page: { padding: "32px 28px", maxWidth: 520, margin: "0 auto" },
  header: { marginBottom: 28 },
  title: { fontSize: 26, fontWeight: 700, color: "#111827", margin: 0 },
  subtitle: { color: "#6b7280", marginTop: 4, fontSize: 14 },
  card: {
    background: "#ffffff", borderRadius: 16, padding: "28px",
    border: "1px solid #f3f4f6", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  formGroup: { marginBottom: 24 },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 8 },
  amountWrapper: {
    display: "flex", alignItems: "center", border: "1px solid #d1d5db",
    borderRadius: 12, overflow: "hidden",
  },
  currency: {
    padding: "14px 16px", background: "#f9fafb", fontWeight: 600,
    fontSize: 18, color: "#374151", borderRight: "1px solid #d1d5db",
  },
  amountInput: { flex: 1, padding: "14px 16px", border: "none", fontSize: 22, fontWeight: 700, outline: "none" },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28 },
  quickBtn: { padding: "10px", borderRadius: 10, border: "1px solid", fontSize: 13, fontWeight: 500, cursor: "pointer" },
  methodsGrid: { display: "flex", flexDirection: "column", gap: 10 },
  methodCard: {
    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
    borderRadius: 12, border: "1.5px solid #e5e7eb", cursor: "pointer",
  },
  methodLabel: { fontSize: 14, fontWeight: 500, color: "#111827" },
  infoBox: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 14px", marginBottom: 20 },
  withdrawBtn: {
    width: "100%", padding: "15px", background: "#dc2626", color: "white",
    border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 8,
  },
};