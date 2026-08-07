import { useState, useEffect } from "react";

function CurrencyConverter() {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("NGN");
  const [toCurrency, setToCurrency] = useState("USD");
  const [result, setResult] = useState(null);

  // Example static rates (you can later replace with real API)
  const rates = {
    NGN: 1,
    USD: 0.00066,
    GBP: 0.00052,
    EUR: 0.00061,
  };

  const currencies = [
    { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬" },
    { code: "USD", name: "US Dollar", flag: "🇺🇸" },
    { code: "GBP", name: "British Pound", flag: "🇬🇧" },
    { code: "EUR", name: "Euro", flag: "🇪🇺" },
  ];

  const convert = () => {
    if (!amount || Number(amount) <= 0) {
      setResult(null);
      return;
    }

    const amountInNGN = Number(amount) / rates[fromCurrency];
    const converted = amountInNGN * rates[toCurrency];

    setResult(converted);
  };

  useEffect(() => {
    convert();
  }, [amount, fromCurrency, toCurrency]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Currency Converter</h1>
        <p style={styles.subtitle}>Convert between major currencies instantly</p>
      </div>

      <div style={styles.card}>
        {/* From */}
        <div style={styles.formGroup}>
          <label style={styles.label}>From</label>
          <div style={styles.row}>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              style={styles.select}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} — {c.name}
                </option>
              ))}
            </select>

            <div style={styles.amountWrapper}>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={styles.amountInput}
              />
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div style={styles.swapContainer}>
          <button onClick={swapCurrencies} style={styles.swapBtn}>
            ⇅
          </button>
        </div>

        {/* To */}
        <div style={styles.formGroup}>
          <label style={styles.label}>To</label>
          <div style={styles.row}>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              style={styles.select}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} — {c.name}
                </option>
              ))}
            </select>

            <div style={{ ...styles.amountWrapper, background: "#f9fafb" }}>
              <input
                type="text"
                value={
                  result !== null
                    ? result.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })
                    : ""
                }
                readOnly
                placeholder="0.00"
                style={{ ...styles.amountInput, background: "#f9fafb" }}
              />
            </div>
          </div>
        </div>

        {/* Result Summary */}
        {result !== null && amount && (
          <div style={styles.resultBox}>
            <p style={styles.resultText}>
              <strong>
                {Number(amount).toLocaleString()} {fromCurrency}
              </strong>{" "}
              ={" "}
              <strong style={{ color: "#2563eb" }}>
                {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                {toCurrency}
              </strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CurrencyConverter;

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
    marginBottom: 8,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 8,
  },
  row: {
    display: "flex",
    gap: 12,
  },
  select: {
    flex: 1.2,
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
    background: "white",
  },
  amountWrapper: {
    flex: 1,
    border: "1px solid #d1d5db",
    borderRadius: 10,
    overflow: "hidden",
  },
  amountInput: {
    width: "100%",
    padding: "12px 14px",
    border: "none",
    fontSize: 18,
    fontWeight: 600,
    outline: "none",
  },
  swapContainer: {
    display: "flex",
    justifyContent: "center",
    margin: "12px 0",
  },
  swapBtn: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "1px solid #e5e7eb",
    background: "white",
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  resultBox: {
    marginTop: 24,
    padding: "16px",
    background: "#f0f9ff",
    borderRadius: 12,
    textAlign: "center",
  },
  resultText: {
    margin: 0,
    fontSize: 16,
    color: "#111827",
  },
};