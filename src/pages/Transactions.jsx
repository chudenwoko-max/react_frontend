import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";
import TransactionModal from "../components/TransactionModal";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [dateRange, setDateRange] = useState("all");

  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [page, setPage] = useState(1);

  const [selectedTx, setSelectedTx] = useState(null);

  const copyRef = (ref) => {
    navigator.clipboard.writeText(ref);
    toast.success("Reference ID copied");
  };

  const fetchTransactions = async (url = "transactions/") => {
    setLoading(true);
    try {
      const params = { search, type, date_range: dateRange, page };
      const res = await axiosClient.get(url, { params });

      setTransactions(res.data.results || []);
      setNextUrl(res.data.next || null);
      setPrevUrl(res.data.previous || null);
    } catch (err) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, type, dateRange, page]);

  const openTransaction = async (reference_id) => {
    try {
      const res = await axiosClient.get(`transactions/${reference_id}/`);
      setSelectedTx(res.data);
    } catch {
      toast.error("Failed to load transaction details");
    }
  };

  const getTypeColor = (type) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("fund") || t.includes("receive")) return { bg: "#dcfce7", color: "#16a34a" };
    if (t.includes("withdraw")) return { bg: "#fee2e2", color: "#dc2626" };
    return { bg: "#dbeafe", color: "#2563eb" };
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Transactions</h1>
        <p style={styles.subtitle}>View and manage your transaction history</p>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search by recipient, amount or reference..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={styles.searchInput}
        />

        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          style={styles.select}
        >
          <option value="">All Types</option>
          <option value="fund">Fund</option>
          <option value="withdraw">Withdraw</option>
          <option value="send">Send</option>
        </select>

        <select
          value={dateRange}
          onChange={(e) => {
            setDateRange(e.target.value);
            setPage(1);
          }}
          style={styles.select}
        >
          <option value="all">All Time</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Table Card */}
      <div style={styles.card}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
            No transactions found
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Reference</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Details</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, index) => {
                const typeStyle = getTypeColor(t.type);
                return (
                  <tr
                    key={index}
                    onClick={() => openTransaction(t.reference_id)}
                    style={styles.tr}
                  >
                    <td
                      style={{ ...styles.td, color: "#2563eb", fontWeight: 500 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        copyRef(t.reference_id);
                      }}
                    >
                      {t.reference_id}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          background: typeStyle.bg,
                          color: typeStyle.color,
                        }}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>
                      ₦{Number(t.amount).toLocaleString()}
                    </td>
                    <td style={styles.td}>{t.description || t.recipient || "—"}</td>
                    <td style={{ ...styles.td, color: "#6b7280", fontSize: 13 }}>
                      {new Date(t.created_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && transactions.length > 0 && (
          <div style={styles.pagination}>
            <button
              onClick={() => prevUrl && setPage(page - 1)}
              disabled={!prevUrl}
              style={{
                ...styles.pageBtn,
                opacity: prevUrl ? 1 : 0.5,
                cursor: prevUrl ? "pointer" : "not-allowed",
              }}
            >
              Previous
            </button>

            <span style={styles.pageText}>Page {page}</span>

            <button
              onClick={() => nextUrl && setPage(page + 1)}
              disabled={!nextUrl}
              style={{
                ...styles.pageBtn,
                opacity: nextUrl ? 1 : 0.5,
                cursor: nextUrl ? "pointer" : "not-allowed",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedTx && (
        <TransactionModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </div>
  );
}

// ================= STYLES =================
const styles = {
  page: {
    padding: "32px 28px",
    maxWidth: 1100,
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
  filters: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: 220,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
  },
  select: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
    background: "white",
    outline: "none",
  },
  card: {
    background: "white",
    borderRadius: 16,
    border: "1px solid #f3f4f6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px 18px",
    fontSize: 13,
    fontWeight: 600,
    color: "#6b7280",
    background: "#f9fafb",
    borderBottom: "1px solid #f3f4f6",
  },
  tr: {
    cursor: "pointer",
    transition: "background 0.15s",
  },
  td: {
    padding: "16px 18px",
    borderBottom: "1px solid #f3f4f6",
    fontSize: 14,
    color: "#111827",
  },
  badge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: "18px",
    borderTop: "1px solid #f3f4f6",
  },
  pageBtn: {
    padding: "8px 16px",
    background: "#f3f4f6",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
  },
  pageText: {
    fontSize: 14,
    color: "#6b7280",
  },
};