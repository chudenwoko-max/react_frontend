import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function ScheduledTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Form state
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [frequency, setFrequency] = useState("once");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchTransfers = async () => {
    try {
      const res = await axiosClient.get("/scheduled/");
      setTransfers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!recipient || !amount || !startDate) {
      toast.error("Recipient, amount and start date are required");
      return;
    }

    setCreating(true);
    try {
      await axiosClient.post("/scheduled/create/", {
        recipient,
        amount,
        note,
        frequency,
        start_date: startDate,
        end_date: endDate || null,
      });
      toast.success("Scheduled transfer created!");
      setShowCreate(false);
      setRecipient("");
      setAmount("");
      setNote("");
      setFrequency("once");
      setStartDate("");
      setEndDate("");
      fetchTransfers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create schedule");
    } finally {
      setCreating(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await axiosClient.post(`/scheduled/${id}/${action}/`);
      toast.success(`Transfer ${action}d successfully`);
      fetchTransfers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Action failed");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: { bg: "#dcfce7", color: "#16a34a" },
      paused: { bg: "#fef3c7", color: "#d97706" },
      completed: { bg: "#dbeafe", color: "#2563eb" },
      cancelled: { bg: "#fee2e2", color: "#dc2626" },
    };
    return colors[status] || colors.active;
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Scheduled Transfers</h1>
          <p style={styles.subtitle}>Automate your payments and remittances</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={styles.createBtn}>
          + New Schedule
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={{ marginTop: 0 }}>Create Scheduled Transfer</h2>
            <form onSubmit={handleCreate}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Recipient Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Amount (₦)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  style={styles.input}
                >
                  <option value="once">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={styles.input}
                />
              </div>

              {frequency !== "once" && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>End Date (optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={styles.input}
                  />
                </div>
              )}

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

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating} style={styles.primaryBtn}>
                  {creating ? "Creating..." : "Create Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfers List */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#6b7280" }}>Loading...</p>
      ) : transfers.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>No scheduled transfers</p>
          <p style={{ color: "#6b7280" }}>
            Create a schedule to automate your payments
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {transfers.map((t) => {
            const statusStyle = getStatusColor(t.status);
            return (
              <div key={t.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <p style={styles.recipient}>{t.recipient}</p>
                    <p style={styles.amount}>
                      ₦{Number(t.amount).toLocaleString()}
                    </p>
                    {t.note && <p style={styles.note}>{t.note}</p>}
                  </div>
                  <span
                    style={{
                      ...styles.badge,
                      background: statusStyle.bg,
                      color: statusStyle.color,
                    }}
                  >
                    {t.status}
                  </span>
                </div>

                <div style={styles.meta}>
                  <span>Frequency: <strong>{t.frequency}</strong></span>
                  <span>Next run: <strong>{t.next_run || "—"}</strong></span>
                  <span>Runs: <strong>{t.total_runs}</strong></span>
                </div>

                {(t.status === "active" || t.status === "paused") && (
                  <div style={styles.actions}>
                    {t.status === "active" ? (
                      <button
                        onClick={() => handleAction(t.id, "pause")}
                        style={styles.secondaryBtn}
                      >
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(t.id, "resume")}
                        style={styles.secondaryBtn}
                      >
                        Resume
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(t.id, "cancel")}
                      style={styles.dangerBtn}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ================= STYLES =================
const styles = {
  page: {
    padding: "32px 28px",
    maxWidth: 700,
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
  createBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  card: {
    background: "white",
    borderRadius: 16,
    padding: "20px",
    border: "1px solid #f3f4f6",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  recipient: {
    margin: 0,
    fontWeight: 600,
    fontSize: 16,
  },
  amount: {
    margin: "4px 0 0",
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
  },
  note: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#6b7280",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  meta: {
    display: "flex",
    gap: 16,
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 14,
    flexWrap: "wrap",
  },
  actions: {
    display: "flex",
    gap: 10,
  },
  secondaryBtn: {
    padding: "8px 14px",
    background: "#f3f4f6",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  dangerBtn: {
    padding: "8px 14px",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: 16,
    border: "1px solid #f3f4f6",
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
    maxWidth: 440,
    maxHeight: "90vh",
    overflowY: "auto",
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