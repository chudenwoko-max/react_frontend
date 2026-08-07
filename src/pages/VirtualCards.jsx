import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function VirtualCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showFund, setShowFund] = useState(null);
  const [fundAmount, setFundAmount] = useState("");
  const [cardType, setCardType] = useState("ngn");
  const [cardName, setCardName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showDetails, setShowDetails] = useState(null); // card id

  const fetchCards = async () => {
    try {
      const res = await axiosClient.get("/cards/");
      setCards(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await axiosClient.post("/cards/create/", {
        card_type: cardType,
        card_name: cardName || undefined,
      });
      toast.success("Virtual card created successfully!");
      setShowCreate(false);
      setCardName("");
      fetchCards();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create card");
    } finally {
      setCreating(false);
    }
  };

  const handleFreeze = async (cardId, currentStatus) => {
    const endpoint = currentStatus === "active" ? "freeze" : "unfreeze";
    try {
      await axiosClient.post(`/cards/${cardId}/${endpoint}/`);
      toast.success(currentStatus === "active" ? "Card frozen" : "Card unfrozen");
      fetchCards();
    } catch (err) {
      toast.error(err.response?.data?.error || "Action failed");
    }
  };

  const handleTerminate = async (cardId) => {
    if (!window.confirm("Are you sure? This action is permanent and remaining balance will be returned to your wallet.")) {
      return;
    }
    try {
      await axiosClient.post(`/cards/${cardId}/terminate/`);
      toast.success("Card terminated");
      fetchCards();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to terminate card");
    }
  };

  const handleFund = async (cardId) => {
    if (!fundAmount || Number(fundAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await axiosClient.post(`/cards/${cardId}/fund/`, { amount: fundAmount });
      toast.success("Card funded successfully");
      setShowFund(null);
      setFundAmount("");
      fetchCards();
    } catch (err) {
      toast.error(err.response?.data?.error || "Funding failed");
    }
  };

  const getCardGradient = (type, status) => {
    if (status === "frozen") return "linear-gradient(135deg, #6b7280, #9ca3af)";
    if (status === "terminated") return "linear-gradient(135deg, #374151, #4b5563)";
    return type === "usd"
      ? "linear-gradient(135deg, #065f46, #10b981)"
      : "linear-gradient(135deg, #1e3a8a, #3b82f6)";
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Virtual Cards</h1>
          <p style={styles.subtitle}>Create and manage your virtual payment cards</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={styles.createBtn}>
          + Create Card
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#6b7280" }}>Loading cards...</p>
      ) : cards.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>No virtual cards yet</p>
          <p style={{ color: "#6b7280", marginBottom: 20 }}>
            Create your first virtual card to start making online payments
          </p>
          <button onClick={() => setShowCreate(true)} style={styles.createBtn}>
            Create Your First Card
          </button>
        </div>
      ) : (
        <div style={styles.cardsGrid}>
          {cards.map((card) => (
            <div key={card.id} style={styles.cardWrapper}>
              {/* Card Visual */}
              <div
                style={{
                  ...styles.cardVisual,
                  background: getCardGradient(card.card_type, card.status),
                }}
              >
                <div style={styles.cardTop}>
                  <span style={styles.cardBrand}>
                    {card.card_type === "usd" ? "VIRTUAL USD" : "VIRTUAL NGN"}
                  </span>
                  <span style={styles.cardStatus}>{card.status}</span>
                </div>

                <div style={styles.chip}></div>

                <p style={styles.cardNumber}>
                  {showDetails === card.id
                    ? card.card_number.replace(/(.{4})/g, "$1 ").trim()
                    : card.masked_number}
                </p>

                <div style={styles.cardBottom}>
                  <div>
                    <p style={styles.cardLabel}>Card Holder</p>
                    <p style={styles.cardValue}>{card.card_name}</p>
                  </div>
                  <div>
                    <p style={styles.cardLabel}>Expires</p>
                    <p style={styles.cardValue}>{card.expiry}</p>
                  </div>
                  {showDetails === card.id && (
                    <div>
                      <p style={styles.cardLabel}>CVV</p>
                      <p style={styles.cardValue}>{card.cvv}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Info & Actions */}
              <div style={styles.cardInfo}>
                <div style={styles.balanceRow}>
                  <span>Balance</span>
                  <strong>
                    {card.currency === "USD" ? "$" : "₦"}
                    {Number(card.balance).toLocaleString()}
                  </strong>
                </div>

                <div style={styles.actions}>
                  <button
                    onClick={() =>
                      setShowDetails(showDetails === card.id ? null : card.id)
                    }
                    style={styles.actionBtn}
                  >
                    {showDetails === card.id ? "Hide Details" : "Show Details"}
                  </button>

                  {card.status !== "terminated" && (
                    <>
                      <button
                        onClick={() => handleFreeze(card.id, card.status)}
                        style={styles.actionBtn}
                      >
                        {card.status === "active" ? "Freeze" : "Unfreeze"}
                      </button>

                      <button
                        onClick={() => setShowFund(card.id)}
                        style={styles.actionBtn}
                      >
                        Fund
                      </button>

                      <button
                        onClick={() => handleTerminate(card.id)}
                        style={{ ...styles.actionBtn, color: "#dc2626" }}
                      >
                        Terminate
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Card Modal */}
      {showCreate && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={{ marginTop: 0 }}>Create Virtual Card</h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>Card Type</label>
              <div style={{ display: "flex", gap: 10 }}>
                {["ngn", "usd"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setCardType(type)}
                    style={{
                      ...styles.typeBtn,
                      background: cardType === type ? "#eff6ff" : "#f9fafb",
                      borderColor: cardType === type ? "#2563eb" : "#e5e7eb",
                      color: cardType === type ? "#2563eb" : "#374151",
                    }}
                  >
                    {type.toUpperCase()} Card
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Name on Card (optional)</label>
              <input
                type="text"
                placeholder="Your name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowCreate(false)} style={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleCreate} disabled={creating} style={styles.primaryBtn}>
                {creating ? "Creating..." : "Create Card"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fund Card Modal */}
      {showFund && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={{ marginTop: 0 }}>Fund Virtual Card</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Amount</label>
              <input
                type="number"
                placeholder="0.00"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                onClick={() => {
                  setShowFund(null);
                  setFundAmount("");
                }}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button onClick={() => handleFund(showFund)} style={styles.primaryBtn}>
                Fund Card
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
    maxWidth: 1000,
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
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 24,
  },
  cardWrapper: {
    background: "white",
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid #f3f4f6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  cardVisual: {
    color: "white",
    padding: "24px",
    minHeight: 200,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardBrand: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 1,
  },
  cardStatus: {
    fontSize: 11,
    background: "rgba(255,255,255,0.2)",
    padding: "3px 10px",
    borderRadius: 20,
    textTransform: "capitalize",
  },
  chip: {
    width: 40,
    height: 28,
    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    borderRadius: 6,
    margin: "16px 0",
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: 600,
    letterSpacing: 2,
    margin: "12px 0",
  },
  cardBottom: {
    display: "flex",
    gap: 24,
  },
  cardLabel: {
    margin: 0,
    fontSize: 10,
    opacity: 0.8,
    textTransform: "uppercase",
  },
  cardValue: {
    margin: "2px 0 0",
    fontSize: 13,
    fontWeight: 600,
  },
  cardInfo: {
    padding: "16px 20px",
  },
  balanceRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 14,
    fontSize: 14,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  actionBtn: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    color: "#374151",
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
  typeBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: 10,
    border: "1.5px solid",
    fontWeight: 600,
    cursor: "pointer",
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