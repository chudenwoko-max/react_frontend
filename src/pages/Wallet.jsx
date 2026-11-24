jsx
import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function Wallet() {
  const [wallets, setWallets] = useState([]);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

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

      setWallets(walletsRes.data || []);
      setRates(ratesRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load wallets");
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

      toast.success(res.data.message || "Conversion successful");

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
    const rate = rates.find(
      (r) => r.from === from && r.to === to
    );

    return rate ? Number(rate.rate) : null;
  };

  const formatBalance = (balance) =>
    Number(balance || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getCurrencyStyle = (currency) => {
    const palettes = {
      NGN: {
        background: "#EDF3F8",
        border: "#D5E1EC",
      },
      USD: {
        background: "#EAF4EE",
        border: "#D1E5D8",
      },
      GBP: {
        background: "#F0EFF7",
        border: "#DEDAEC",
      },
      EUR: {
        background: "#F6F2E9",
        border: "#E9DFC9",
      },
    };

    return palettes[currency] || {
      background: "#F1F4F7",
      border: "#DEE4EA",
    };
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#475569" }}>
        Loading wallets…
      </div>
    );
  }

  const primaryWallet =
    wallets.find((w) => w.is_default) || wallets[0];

  const hasWallets = wallets.length > 0;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Wallets</h1>
          <p style={styles.subtitle}>
            View and manage your balances
          </p>
        </div>
      </div>

      <div style={styles.infoBanner}>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
          <strong>Local funding:</strong> Add money via bank transfer
          to your NGN wallet.{" "}
          <strong>International cards:</strong> Payments made with
          foreign cards (via Paystack) settle into your NGN balance
          after conversion. Full multi-currency holding requires a
          separate domiciliary account.
        </p>
      </div>

      {primaryWallet && (
        <div style={styles.primaryCard}>
          <p style={styles.primaryLabel}>Primary balance</p>

          <h2 style={styles.primaryBalance}>
            {primaryWallet.symbol}
            {formatBalance(primaryWallet.balance)}
          </h2>

          <p style={styles.primaryCurrency}>
            {primaryWallet.currency_code} ·{" "}
            {primaryWallet.currency_name}

            {primaryWallet.currency_code === "NGN" && (
              <span style={styles.localTag}> · Local</span>
            )}
          </p>
        </div>
      )}

      {!hasWallets && (
        <div style={styles.emptyState}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>
            No wallets yet
          </p>

          <p style={{ color: "#475569", marginBottom: 16 }}>
            Your wallets will appear here once they are created.
          </p>

          <Link to="/fund-wallet" style={styles.primaryBtn}>
            Add money
          </Link>
        </div>
      )}

      {hasWallets && (
        <div style={styles.walletsGrid}>
          {wallets.map((wallet) => {
            const palette = getCurrencyStyle(wallet.currency_code);

            return (
              <div
                key={wallet.id}
                style={{
                  ...styles.walletCard,
                  background: palette.background,
                  border: `1px solid ${palette.border}`,
                }}
              >
                <div style={styles.walletTop}>
                  <span style={styles.currencyCode}>
                    {wallet.currency_code}
                  </span>

                  {wallet.is_default && (
                    <span style={styles.defaultBadge}>
                      Primary
                    </span>
                  )}
                </div>

                <p style={styles.currencyName}>
                  {wallet.currency_name}
                </p>

                <h3 style={styles.balance}>
                  {wallet.symbol}
                  {formatBalance(wallet.balance)}
                </h3>

                {wallet.currency_code === "NGN" && (
                  <p style={styles.walletNote}>
                    Local settlements
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={styles.actionsGrid}>
        <Link to="/fund-wallet" style={styles.actionCard}>
          <span style={styles.actionIcon}>↓</span>

          <div>
            <p style={styles.actionTitle}>Add money</p>
            <p style={styles.actionDesc}>
              Fund your NGN wallet
            </p>
          </div>
        </Link>

        <Link to="/send-money" style={styles.actionCard}>
          <span style={styles.actionIcon}>↑</span>

          <div>
            <p style={styles.actionTitle}>Send</p>
            <p style={styles.actionDesc}>
              Transfer to others
            </p>
          </div>
        </Link>

        <Link to="/withdraw" style={styles.actionCard}>
          <span style={styles.actionIcon}>↗</span>

          <div>
            <p style={styles.actionTitle}>Withdraw</p>
            <p style={styles.actionDesc}>
              To bank account
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setShowConvert(true)}
          style={styles.actionCard}
          disabled={!hasWallets}
        >
          <span style={styles.actionIcon}>⇄</span>

          <div>
            <p style={styles.actionTitle}>Convert</p>
            <p style={styles.actionDesc}>
              Exchange currency
            </p>
          </div>
        </button>
      </div>

      {showConvert && (
        <div
          style={styles.modalOverlay}
          onClick={() => setShowConvert(false)}
        >
          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={styles.modalTitle}>
              Convert currency
            </h2>

            <p style={styles.modalDescription}>
              Conversion uses available rates. International card
              payments settle into NGN after conversion.
            </p>

            <div style={styles.formGroup}>
              <label style={styles.label}>From</label>

              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                style={styles.input}
              >
                {wallets.map((w) => (
                  <option
                    key={w.currency_code}
                    value={w.currency_code}
                  >
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
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={styles.input}
              />
            </div>

            {getRate(fromCurrency, toCurrency) &&
              amount &&
              Number(amount) > 0 && (
                <div style={styles.rateBox}>
                  <p style={{ margin: 0, fontSize: 14 }}>
                    You’ll receive approximately{" "}
                    <strong>
                      {(
                        Number(amount) *
                        getRate(fromCurrency, toCurrency)
                      ).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      {toCurrency}
                    </strong>
                  </p>

                  <p style={styles.rateDescription}>
                    1 {fromCurrency} ={" "}
                    {getRate(fromCurrency, toCurrency)} {toCurrency}
                  </p>
                </div>
              )}

            <div style={styles.modalActions}>
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
                {converting ? "Converting…" : "Convert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "32px 28px",
    maxWidth: 900,
    margin: "0 auto",
    fontFamily: 'Georgia, "Times New Roman", serif',
    color: "#475569",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: 700,
    color: "#475569",
    margin: 0,
  },

  subtitle: {
    color: "#475569",
    marginTop: 4,
    fontSize: 14,
  },

  primaryBtn: {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    fontFamily: "inherit",
  },

  infoBanner: {
    background: "#F1F5F9",
    border: "1px solid #DCE4EC",
    borderRadius: 12,
    padding: "12px 16px",
    marginBottom: 20,
    color: "#475569",
  },

  primaryCard: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },

  primaryLabel: {
    margin: 0,
    fontSize: 13,
    color: "#475569",
    fontWeight: 500,
  },

  primaryBalance: {
    margin: "6px 0 4px",
    fontSize: 32,
    fontWeight: 700,
    color: "#475569",
  },

  primaryCurrency: {
    margin: 0,
    fontSize: 14,
    color: "#475569",
  },

  localTag: {
    color: "#475569",
    fontWeight: 600,
  },

  emptyState: {
    textAlign: "center",
    padding: "48px 20px",
    background: "#FFFFFF",
    borderRadius: 16,
    border: "1px solid #E2E8F0",
    marginBottom: 24,
  },

  walletsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 16,
    marginBottom: 28,
  },

  walletCard: {
    color: "#475569",
    borderRadius: 16,
    padding: 22,
    boxShadow: "0 3px 12px rgba(15, 23, 42, 0.045)",
    fontFamily: 'Georgia, "Times New Roman", serif',
    transition: "box-shadow 0.2s ease",
  },

  walletTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  currencyCode: {
    fontSize: 14,
    fontWeight: 700,
    color: "#475569",
    letterSpacing: "0.5px",
  },

  defaultBadge: {
    fontSize: 10,
    color: "#475569",
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(100,116,139,0.15)",
    padding: "4px 9px",
    borderRadius: 10,
    fontWeight: 600,
  },

  currencyName: {
    margin: "0 0 12px",
    fontSize: 13,
    color: "#475569",
  },

  balance: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: "#475569",
  },

  walletNote: {
    margin: "8px 0 0",
    fontSize: 11,
    color: "#475569",
  },

  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
  },

  actionCard: {
    background: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    border: "1px solid #E2E8F0",
    display: "flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
    color: "#475569",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
  },

  actionIcon: {
    fontSize: 22,
    color: "#475569",
  },

  actionTitle: {
    margin: 0,
    fontWeight: 600,
    fontSize: 14,
    color: "#475569",
  },

  actionDesc: {
    margin: "2px 0 0",
    fontSize: 12,
    color: "#475569",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  modal: {
    background: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    width: "90%",
    maxWidth: 420,
    color: "#475569",
    fontFamily: 'Georgia, "Times New Roman", serif',
  },

  modalTitle: {
    margin: "0 0 8px",
    fontSize: 20,
    color: "#475569",
  },

  modalDescription: {
    margin: "0 0 16px",
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.5,
  },

  formGroup: {
    marginBottom: 16,
  },

  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#475569",
    marginBottom: 6,
  },

  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1px solid #CBD5E1",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    color: "#475569",
    background: "#FFFFFF",
    fontFamily: "inherit",
  },

  rateBox: {
    background: "#F1F5F9",
    border: "1px solid #E2E8F0",
    color: "#475569",
    padding: "12px 14px",
    borderRadius: 10,
    marginTop: 8,
  },

  rateDescription: {
    margin: "4px 0 0",
    fontSize: 12,
    color: "#475569",
  },

  modalActions: {
    display: "flex",
    gap: 10,
    marginTop: 24,
  },

  cancelBtn: {
    flex: 1,
    padding: 11,
    background: "#FFFFFF",
    color: "#475569",
    border: "1px solid #CBD5E1",
    borderRadius: 10,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};