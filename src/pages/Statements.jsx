import { useState } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function Statements() {
  const [month, setMonth] = useState("");
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    if (!month) {
      toast.error("Please select a month");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosClient.get(`/statements/?month=${month}`);
      setStatement(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load statement");
      setStatement(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Account Statements</h1>
          <p style={styles.subtitle}>View and download your monthly statements</p>
        </div>
      </div>

      {/* Month Selector */}
      <div style={styles.card}>
        <div style={styles.selectorRow}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Select Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={styles.input}
            />
          </div>
          <button
            onClick={handleFetch}
            disabled={loading}
            style={styles.primaryBtn}
          >
            {loading ? "Loading..." : "Generate Statement"}
          </button>
        </div>
      </div>

      {/* Statement Result */}
      {statement && (
        <div style={styles.statementCard} id="statement-print">
          <div style={styles.statementHeader}>
            <div>
              <h2 style={{ margin: 0 }}>OrbitPay</h2>
              <p style={{ margin: "4px 0 0", color: "#6b7280" }}>
                Account Statement
              </p>
            </div>
            <button onClick={handlePrint} style={styles.printBtn}>
              Print / Save PDF
            </button>
          </div>

          <div style={styles.userInfo}>
            <p><strong>Account Holder:</strong> {statement.user.username}</p>
            <p><strong>Email:</strong> {statement.user.email || "—"}</p>
            <p><strong>Period:</strong> {statement.month}</p>
          </div>

          {/* Summary */}
          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <p style={styles.summaryLabel}>Total Inflow</p>
              <p style={styles.summaryValue}>
                ₦{Number(statement.summary.total_inflow).toLocaleString()}
              </p>
            </div>
            <div style={styles.summaryItem}>
              <p style={styles.summaryLabel}>Total Outflow</p>
              <p style={styles.summaryValue}>
                ₦{Number(statement.summary.total_outflow).toLocaleString()}
              </p>
            </div>
            <div style={styles.summaryItem}>
              <p style={styles.summaryLabel}>Transactions</p>
              <p style={styles.summaryValue}>
                {statement.summary.transaction_count}
              </p>
            </div>
            <div style={styles.summaryItem}>
              <p style={styles.summaryLabel}>Closing Balance</p>
              <p style={styles.summaryValue}>
                ₦{Number(statement.summary.closing_balance).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Transactions Table */}
          <h3 style={{ marginTop: 28, marginBottom: 12 }}>Transactions</h3>

          {statement.transactions.length === 0 ? (
            <p style={{ color: "#9ca3af", textAlign: "center", padding: 20 }}>
              No transactions for this month
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {statement.transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td style={styles.td}>{tx.date}</td>
                      <td style={styles.td}>{tx.type}</td>
                      <td style={styles.td}>{tx.description}</td>
                      <td style={styles.td}>
                        ₦{Number(tx.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
    marginBottom: 24,
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
    background: "white",
    borderRadius: 16,
    padding: "20px",
    border: "1px solid #f3f4f6",
    marginBottom: 24,
  },
  selectorRow: {
    display: "flex",
    gap: 16,
    alignItems: "flex-end",
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
  primaryBtn: {
    padding: "12px 20px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  statementCard: {
    background: "white",
    borderRadius: 16,
    padding: "28px",
    border: "1px solid #f3f4f6",
  },
  statementHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    borderBottom: "1px solid #f3f4f6",
    paddingBottom: 16,
  },
  printBtn: {
    padding: "8px 16px",
    background: "#f3f4f6",
    border: "none",
    borderRadius: 8,
    fontWeight: 500,
    cursor: "pointer",
  },
  userInfo: {
    marginBottom: 20,
    fontSize: 14,
    color: "#374151",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
  },
  summaryItem: {
    background: "#f9fafb",
    padding: "14px",
    borderRadius: 10,
    textAlign: "center",
  },
  summaryLabel: {
    margin: 0,
    fontSize: 12,
    color: "#6b7280",
  },
  summaryValue: {
    margin: "6px 0 0",
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: "2px solid #e5e7eb",
    color: "#6b7280",
    fontWeight: 600,
  },
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid #f3f4f6",
  },
};