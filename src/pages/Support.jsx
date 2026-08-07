import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetail, setTicketDetail] = useState(null);

  // Create form
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [creating, setCreating] = useState(false);

  // Reply
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await axiosClient.get("/support/");
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error("Subject and message are required");
      return;
    }

    setCreating(true);
    try {
      await axiosClient.post("/support/create/", {
        subject,
        message,
        category,
      });
      toast.success("Ticket created successfully");
      setShowCreate(false);
      setSubject("");
      setMessage("");
      setCategory("general");
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create ticket");
    } finally {
      setCreating(false);
    }
  };

  const openTicket = async (ticketId) => {
    try {
      const res = await axiosClient.get(`/support/${ticketId}/`);
      setTicketDetail(res.data);
      setSelectedTicket(ticketId);
    } catch (err) {
      toast.error("Failed to load ticket");
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSendingReply(true);
    try {
      await axiosClient.post(`/support/${selectedTicket}/reply/`, {
        message: reply,
      });
      toast.success("Reply sent");
      setReply("");
      openTicket(selectedTicket); // refresh messages
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      open: { bg: "#dbeafe", color: "#2563eb" },
      in_progress: { bg: "#fef3c7", color: "#d97706" },
      resolved: { bg: "#dcfce7", color: "#16a34a" },
      closed: { bg: "#f3f4f6", color: "#6b7280" },
    };
    return styles[status] || styles.open;
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Help & Support</h1>
          <p style={styles.subtitle}>Create a ticket and our team will assist you</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={styles.createBtn}>
          + New Ticket
        </button>
      </div>

      {/* Create Ticket Modal */}
      {showCreate && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={{ marginTop: 0 }}>Create Support Ticket</h2>
            <form onSubmit={handleCreate}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={styles.input}
                >
                  <option value="general">General</option>
                  <option value="transaction">Transaction Issue</option>
                  <option value="kyc">KYC / Verification</option>
                  <option value="card">Virtual Card</option>
                  <option value="login">Login / Security</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Subject</label>
                <input
                  type="text"
                  placeholder="Brief summary of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Message</label>
                <textarea
                  placeholder="Describe your issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ ...styles.input, height: 120, resize: "vertical" }}
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
                  {creating ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail View */}
      {selectedTicket && ticketDetail ? (
        <div style={styles.detailCard}>
          <button
            onClick={() => {
              setSelectedTicket(null);
              setTicketDetail(null);
            }}
            style={styles.backBtn}
          >
            ← Back to tickets
          </button>

          <div style={styles.detailHeader}>
            <div>
              <h2 style={{ margin: 0 }}>#{ticketDetail.id} – {ticketDetail.subject}</h2>
              <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: 14 }}>
                {ticketDetail.category} • {ticketDetail.created_at}
              </p>
            </div>
            <span
              style={{
                ...styles.badge,
                background: getStatusStyle(ticketDetail.status).bg,
                color: getStatusStyle(ticketDetail.status).color,
              }}
            >
              {ticketDetail.status.replace("_", " ")}
            </span>
          </div>

          {/* Messages */}
          <div style={styles.messages}>
            {ticketDetail.messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...styles.messageBubble,
                  alignSelf: msg.is_staff_reply ? "flex-start" : "flex-end",
                  background: msg.is_staff_reply ? "#f3f4f6" : "#dbeafe",
                }}
              >
                <p style={styles.msgSender}>
                  {msg.is_staff_reply ? "Support Team" : "You"}
                </p>
                <p style={styles.msgText}>{msg.message}</p>
                <p style={styles.msgTime}>{msg.created_at}</p>
              </div>
            ))}
          </div>

          {/* Reply Box */}
          {ticketDetail.status !== "closed" && ticketDetail.status !== "resolved" && (
            <div style={styles.replyBox}>
              <textarea
                placeholder="Type your reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                style={{ ...styles.input, height: 80 }}
              />
              <button
                onClick={handleReply}
                disabled={sendingReply}
                style={styles.primaryBtn}
              >
                {sendingReply ? "Sending..." : "Send Reply"}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Tickets List */
        <div>
          {loading ? (
            <p style={{ textAlign: "center", color: "#6b7280" }}>Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 18, marginBottom: 8 }}>No support tickets yet</p>
              <p style={{ color: "#6b7280" }}>
                Create a ticket if you need help with anything
              </p>
            </div>
          ) : (
            <div style={styles.list}>
              {tickets.map((ticket) => {
                const statusStyle = getStatusStyle(ticket.status);
                return (
                  <div
                    key={ticket.id}
                    onClick={() => openTicket(ticket.id)}
                    style={styles.ticketCard}
                  >
                    <div>
                      <p style={styles.ticketSubject}>
                        #{ticket.id} – {ticket.subject}
                      </p>
                      <p style={styles.ticketMeta}>
                        {ticket.category} • {ticket.created_at}
                      </p>
                    </div>
                    <span
                      style={{
                        ...styles.badge,
                        background: statusStyle.bg,
                        color: statusStyle.color,
                      }}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                );
              })}
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
    maxWidth: 800,
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
    gap: 12,
  },
  ticketCard: {
    background: "white",
    padding: "16px 20px",
    borderRadius: 12,
    border: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  ticketSubject: {
    margin: 0,
    fontWeight: 600,
    fontSize: 15,
  },
  ticketMeta: {
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
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: 16,
    border: "1px solid #f3f4f6",
  },
  detailCard: {
    background: "white",
    borderRadius: 16,
    padding: "24px",
    border: "1px solid #f3f4f6",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontSize: 14,
    cursor: "pointer",
    marginBottom: 16,
    padding: 0,
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  messages: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 24,
    maxHeight: 400,
    overflowY: "auto",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: "12px 16px",
    borderRadius: 12,
  },
  msgSender: {
    margin: 0,
    fontSize: 12,
    fontWeight: 600,
    color: "#6b7280",
  },
  msgText: {
    margin: "4px 0",
    fontSize: 14,
    color: "#111827",
  },
  msgTime: {
    margin: 0,
    fontSize: 11,
    color: "#9ca3af",
  },
  replyBox: {
    borderTop: "1px solid #f3f4f6",
    paddingTop: 16,
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
    maxWidth: 480,
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
    marginTop: 10,
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