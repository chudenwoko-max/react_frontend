import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function Wallet() {
  const [wallets, setWallets] = useState([]);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Convert form
  const [showConvert, setShowConvert] = useState(false);
  const [fromCurrency, setFromCurrency] = useState("NGN");
  const [toCurrency, setToCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [converting, setConverting] = useState(false);

  const fetchData = async () => {
    try {
      const [walletsRes, ratesRes] = await Promise.all([
        axiosClient.get("/wallets/"),
        axiosClient.get("/wallets/rates/"),
      ]);
      setWallets(walletsRes.data);
      setRates(ratesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConvert = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (fromCurrency === toCurrency) {
      toast.error("Select different currencies");
      return;
    }

    setConverting(true);
    try {
      const res = await axiosClient.post("/wallets/convert/", {
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount,
      });
      toast.success(res.data.message);
      setAmount("");
      setShowConvert(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Conversion failed");
    } finally {
      setConverting(false);
    }
  };

  const getRate = (from, to) => {
    const rate = rates.find((r) => r.from === from && r.to === to);
    return rate ? Number(rate.rate) : null;
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
        Loading wallets...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Wallets</h1>
          <p style={styles.subtitle}>Manage your multi-currency balances</p>
        </div>
        <button onClick={() => setShowConvert(true)} style={styles.convertBtn}>
          Convert Currency
        </button>
      </div>

      {/* Wallets Grid */}
      <div style={styles.walletsGrid}>
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            style={{
              ...styles.walletCard,
              background:
                wallet.currency_code === "NGN"
                  ? "linear-gradient(135deg, #1e40af, #3b82f6)"
                  : wallet.currency_code === "USD"
                  ? "linear-gradient(135deg, #065f46, #10b981)"
                  : wallet.currency_code === "GBP"
                  ? "linear-gradient(135deg, #7c2d12, #ea580c)"
                  : "linear-gradient(135deg, #4c1d95, #8b5cf6)",
            }}
          >
            <div style={styles.walletTop}>
              <span style={styles.currencyCode}>{wallet.currency_code}</span>
              {wallet.is_default && <span style={styles.defaultBadge}>Default</span>}
            </div>
            <p style={styles.currencyName}>{wallet.currency_name}</p>
            <h2 style={styles.balance}>
              {wallet.symbol}
              {Number(wallet.balance).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </h2>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={styles.actionsGrid}>
        <Link to="/fund-wallet" style={styles.actionCard}>
          <span style={{ fontSize: 22 }}>↓</span>
          <div>
            <p style={styles.actionTitle}>Fund Wallet</p>
            <p style={styles.actionDesc}>Add money</p>
          </div>
        </Link>
        <Link to="/send-money" style={styles.actionCard}>
          <span style={{ fontSize: 22 }}>↑</span>
          <div>
            <p style={styles.actionTitle}>Send Money</p>
            <p style={styles.actionDesc}>Transfer funds</p>
          </div>
        </Link>
        <Link to="/withdraw" style={styles.actionCard}>
          <span style={{ fontSize: 22 }}>↗</span>
          <div>
            <p style={styles.actionTitle}>Withdraw</p>
            <p style={styles.actionDesc}>To bank account</p>
          </div>
        </Link>
        <div onClick={() => setShowConvert(true)} style={{ ...styles.actionCard, cursor: "pointer" }}>
          <span style={{ fontSize: 22 }}>⇄</span>
          <div>
            <p style={styles.actionTitle}>Convert</p>
            <p style={styles.actionDesc}>Exchange currency</p>
          </div>
        </div>
      </div>

      {/* Convert Modal */}
      {showConvert && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>Convert Currency</h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>From</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                style={styles.input}
              >
                {wallets.map((w) => (
                  <option key={w.currency_code} value={w.currency_code}>
                    {w.currency_code} — {w.currency_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>To</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                style={styles.input}
              >
                {["NGN", "USD", "GBP", "EUR"].map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Amount</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={styles.input}
              />
            </div>

            {getRate(fromCurrency, toCurrency) && amount && (
              <div style={styles.rateBox}>
                <p style={{ margin: 0, fontSize: 14 }}>
                  You will receive approximately:{" "}
                  <strong>
                    {(Number(amount) * getRate(fromCurrency, toCurrency)).toLocaleString(
                      undefined,
                      { maximumFractionDigits: 2 }
                    )}{" "}
                    {toCurrency}
                  </strong>
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>
                  Rate: 1 {fromCurrency} = {getRate(fromCurrency, toCurrency)} {toCurrency}
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowConvert(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleConvert}
                disabled={converting}
                style={styles.primaryBtn}
              >
                {converting ? "Converting..." : "Convert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= STYLES =================
const styles = {
  page: {
    padding: "32px 28px",
    maxWidth: 900,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
  convertBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
  },
  walletsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 16,
    marginBottom: 28,
  },
  walletCard: {
    color: "white",
    borderRadius: 16,
    padding: "22px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  },
  walletTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: 600,
    opacity: 0.9,
  },
  defaultBadge: {
    fontSize: 10,
    background: "rgba(255,255,255,0.25)",
    padding: "2px 8px",
    borderRadius: 10,
  },
  currencyName: {
    margin: "0 0 12px 0",
    fontSize: 13,
    opacity: 0.85,
  },
  balance: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: 12,
  },
  actionCard: {
    background: "white",
    padding: "16px",
    borderRadius: 12,
    border: "1px solid #f3f4f6",
    display: "flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
    color: "inherit",
  },
  actionTitle: {
    margin: 0,
    fontWeight: 600,
    fontSize: 14,
  },
  actionDesc: {
    margin: "2px 0 0",
    fontSize: 12,
    color: "#6b7280",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    borderRadius: 16,
    padding: "28px",
    width: "90%",
    maxWidth: 420,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 15,
    outline: "none",
  },
  rateBox: {
    background: "#f0f9ff",
    padding: "12px 14px",
    borderRadius: 10,
    marginTop: 8,
  },
  primaryBtn: {
    flex: 1,
    padding: "11px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
  },
  cancelBtn: {
    flex: 1,
    padding: "11px",
    background: "white",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    fontWeight: 500,
    cursor: "pointer",
  },
};