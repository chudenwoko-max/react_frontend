import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function RequestMoney() {
  const [activeTab, setActiveTab] = useState("request"); // request | received | sent
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);

  // Fetch received & sent requests
  const fetchRequests = async () => {
    try {
      const [receivedRes, sentRes] = await Promise.all([
        axiosClient.get("/request-money/received/"),
        axiosClient.get("/request-money/sent/"),
      ]);
      setReceived(receivedRes.data);
      setSent(sentRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Search users
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    axiosClient
      .get(`/users/search/?q=${value}`)
      .then((res) => setResults(res.data.results || []))
      .catch(() => setResults([]));
  };

  // Create request
  const handleCreateRequest = async () => {
    if (!selectedUser) {
      toast.error("Select a user first");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post("/request-money/", {
        recipient: selectedUser.username,
        amount,
        note,
      });

      toast.success("Money request sent!");
      setAmount("");
      setNote("");
      setSearch("");
      setSelectedUser(null);
      setResults([]);
      fetchRequests();
      setActiveTab("sent");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  // Pay a request
  const handlePay = async (id) => {
    try {
      await axiosClient.post(`/request-money/${id}/pay/`);
      toast.success("Payment successful!");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || "Payment failed");
    }
  };

  // Decline a request
  const handleDecline = async (id) => {
    try {
      await axiosClient.post(`/request-money/${id}/decline/`);
      toast.success("Request declined");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to decline");
    }
  };

  // Cancel a request
  const handleCancel = async (id) => {
    try {
      await axiosClient.post(`/request-money/${id}/cancel/`);
      toast.success("Request cancelled");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to cancel");
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: { background: "#fef3c7", color: "#d97706" },
      paid: { background: "#dcfce7", color: "#16a34a" },
      declined: { background: "#fee2e2", color: "#dc2626" },
      cancelled: { background: "#f3f4f6", color: "#6b7280" },
    };
    return styles[status] || styles.pending;
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Request Money</h1>
        <p style={styles.subtitle}>Request or manage money requests</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {["request", "received", "sent"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              background: activeTab === tab ? "#2563eb" : "transparent",
              color: activeTab === tab ? "white" : "#6b7280",
            }}
          >
            {tab === "request" && "New Request"}
            {tab === "received" && `Received (${received.filter(r => r.status === "pending").length})`}
            {tab === "sent" && "Sent"}
          </button>
        ))}
      </div>

      <div style={styles.card}>
        {/* ========== NEW REQUEST TAB ========== */}
        {activeTab === "request" && (
          <div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Request From</label>
              <input
                type="text"
                placeholder="Search username..."
                value={search}
                onChange={handleSearch}
                style={styles.input}
              />
            </div>

            {results.length > 0 && (
              <div style={styles.resultsBox}>
                {results.map((user, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedUser(user);
                      setSearch(user.username);
                      setResults([]);
                    }}
                    style={styles.resultItem}
                  >
                    <strong>{user.username}</strong>
                    <span style={{ color: "#6b7280", fontSize: 13 }}>{user.email}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedUser && (
              <div style={styles.selectedBox}>
                Requesting from: <strong>{selectedUser.username}</strong>
              </div>
            )}

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

            <div style={styles.formGroup}>
              <label style={styles.label}>Note (optional)</label>
              <input
                type="text"
                placeholder="What's this for?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={styles.input}
              />
            </div>

            <button
              onClick={handleCreateRequest}
              disabled={loading}
              style={styles.primaryBtn}
            >
              {loading ? "Sending..." : "Send Request"}
            </button>
          </div>
        )}

        {/* ========== RECEIVED TAB ========== */}
        {activeTab === "received" && (
          <div>
            {received.length === 0 ? (
              <p style={styles.empty}>No money requests received</p>
            ) : (
              received.map((req) => (
                <div key={req.id} style={styles.requestItem}>
                  <div>
                    <p style={styles.reqName}>{req.requester}</p>
                    <p style={styles.reqAmount}>₦{Number(req.amount).toLocaleString()}</p>
                    {req.note && <p style={styles.reqNote}>{req.note}</p>}
                    <p style={styles.reqDate}>{req.created_at}</p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ ...styles.badge, ...getStatusStyle(req.status) }}>
                      {req.status}
                    </span>

                    {req.status === "pending" && (
                      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                        <button onClick={() => handlePay(req.id)} style={styles.payBtn}>
                          Pay
                        </button>
                        <button onClick={() => handleDecline(req.id)} style={styles.declineBtn}>
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========== SENT TAB ========== */}
        {activeTab === "sent" && (
          <div>
            {sent.length === 0 ? (
              <p style={styles.empty}>No money requests sent</p>
            ) : (
              sent.map((req) => (
                <div key={req.id} style={styles.requestItem}>
                  <div>
                    <p style={styles.reqName}>To: {req.recipient}</p>
                    <p style={styles.reqAmount}>₦{Number(req.amount).toLocaleString()}</p>
                    {req.note && <p style={styles.reqNote}>{req.note}</p>}
                    <p style={styles.reqDate}>{req.created_at}</p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ ...styles.badge, ...getStatusStyle(req.status) }}>
                      {req.status}
                    </span>

                    {req.status === "pending" && (
                      <button
                        onClick={() => handleCancel(req.id)}
                        style={{ ...styles.declineBtn, marginTop: 10 }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ================= STYLES =================
const styles = {
  page: {
    padding: "32px 28px",
    maxWidth: 600,
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
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 20,
    background: "#f3f4f6",
    padding: 4,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  card: {
    background: "white",
    borderRadius: 16,
    padding: "24px",
    border: "1px solid #f3f4f6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
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
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 15,
    outline: "none",
  },
  amountWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    overflow: "hidden",
  },
  currency: {
    padding: "12px 14px",
    background: "#f9fafb",
    fontWeight: 600,
    borderRight: "1px solid #d1d5db",
  },
  amountInput: {
    flex: 1,
    padding: "12px 14px",
    border: "none",
    fontSize: 18,
    fontWeight: 600,
    outline: "none",
  },
  resultsBox: {
    background: "#f9fafb",
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
  resultItem: {
    padding: "12px 14px",
    cursor: "pointer",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  selectedBox: {
    background: "#eff6ff",
    padding: "10px 14px",
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  primaryBtn: {
    width: "100%",
    padding: "14px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
  },
  requestItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  reqName: {
    margin: 0,
    fontWeight: 600,
    fontSize: 15,
  },
  reqAmount: {
    margin: "4px 0",
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },
  reqNote: {
    margin: "2px 0",
    fontSize: 13,
    color: "#6b7280",
  },
  reqDate: {
    margin: "4px 0 0",
    fontSize: 12,
    color: "#9ca3af",
  },
  badge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  payBtn: {
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "6px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  declineBtn: {
    background: "white",
    color: "#dc2626",
    border: "1px solid #fecaca",
    padding: "6px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  empty: {
    textAlign: "center",
    color: "#9ca3af",
    padding: "30px 0",
  },
};