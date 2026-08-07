import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

import PinModal from "../components/PinModal";
import FavoriteRecipients from "../components/FavoriteRecipients";
import AddFavoriteModal from "../components/AddFavoriteModal";

export default function SendMoney() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinMode, setPinMode] = useState("verify"); // "set" or "verify"
  const [pendingUser, setPendingUser] = useState(null);
  const [pendingAmount, setPendingAmount] = useState("");

  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [lastRecipient, setLastRecipient] = useState("");

  // Automatically ask to create PIN if not set
  useEffect(() => {
  const hasPin = localStorage.getItem("HAS_PIN");
  if (!hasPin) {
    setPinMode("set");
    setShowPinModal(true);
  }
}, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    axiosClient
      .get(`/users/search/?q=${value}`)
      .then((res) => setResults(res.data.results || res.data))
      .catch(() => setResults([]));
  };

  const handleSend = () => {
    if (!selectedUser) {
      toast.error("Select a recipient first");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    setPendingUser(selectedUser);
    setPendingAmount(amount);
    setPinMode("verify");
    setShowPinModal(true);
  };

  const handlePinVerified = async (pin) => {
    // If we are in "set" mode
    if (pinMode === "set") {
      localStorage.setItem("HAS_PIN", "true");
      toast.success("PIN created successfully!");
      setShowPinModal(false);
      return;
    }

    // Normal send money flow
    if (!pendingUser?.username) {
      toast.error("Recipient lost. Please try again.");
      return;
    }

    const pinToken = localStorage.getItem("PIN_TOKEN");
    if (!pinToken) {
      toast.error("PIN token missing. Please try again.");
      return;
    }

    try {
      await axiosClient.post("/send-money/", {
        recipient: pendingUser.username,
        amount: pendingAmount,
        pin: pin,
        pin_token: pinToken,
      });

      toast.success("Transfer successful!");
      localStorage.removeItem("PIN_TOKEN");

      setLastRecipient(pendingUser.username);
      setShowFavoriteModal(true);

      // Reset form
      setAmount("");
      setSearch("");
      setResults([]);
      setSelectedUser(null);
      setPendingUser(null);
      setPendingAmount("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Transfer failed");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Send Money</h1>
        <p style={styles.subtitle}>Transfer funds to friends and family instantly</p>
      </div>

      <div style={styles.card}>
        {/* Favorites */}
        <div style={{ marginBottom: 24 }}>
          <FavoriteRecipients
            onSelect={(fav) => {
              setSelectedUser(fav.recipient);
              setSearch(fav.recipient.username);
              setResults([]);
            }}
          />
        </div>

        {/* Search */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Recipient</label>
          <input
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={handleSearch}
            style={styles.input}
          />
        </div>

        {/* Search Results */}
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
                style={{
                  ...styles.resultItem,
                  background: selectedUser?.username === user.username ? "#eff6ff" : "transparent",
                }}
              >
                <div style={styles.avatar}>
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={styles.resultName}>{user.username}</p>
                  <p style={styles.resultEmail}>{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected User */}
        {selectedUser && (
          <div style={styles.selectedBox}>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Sending to</p>
              <p style={{ margin: "2px 0 0", fontWeight: 600 }}>{selectedUser.username}</p>
            </div>
            <button
              onClick={() => {
                setLastRecipient(selectedUser.username);
                setShowFavoriteModal(true);
              }}
              style={styles.favoriteBtn}
            >
              ★ Save
            </button>
          </div>
        )}

        {/* Amount */}
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

        {/* Send Button */}
        <button onClick={handleSend} style={styles.sendBtn}>
          Continue
        </button>
      </div>

      {/* Modals */}
      <AddFavoriteModal
        open={showFavoriteModal}
        onClose={() => setShowFavoriteModal(false)}
        recipientUsername={lastRecipient}
      />

      <PinModal
        open={showPinModal}
        onClose={() => setShowPinModal(false)}
        onVerified={handlePinVerified}
        mode={pinMode}
      />
    </div>
  );
}

// ================= STYLES =================
const styles = {
  page: {
    padding: "32px 28px",
    maxWidth: 560,
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
    padding: "28px 28px",
    border: "1px solid #f3f4f6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  formGroup: {
    marginBottom: 20,
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
  resultsBox: {
    background: "#f9fafb",
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
  },
  resultItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    cursor: "pointer",
    borderBottom: "1px solid #f3f4f6",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#2563eb",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: 16,
  },
  resultName: {
    margin: 0,
    fontWeight: 600,
    fontSize: 14,
    color: "#111827",
  },
  resultEmail: {
    margin: "2px 0 0",
    fontSize: 12,
    color: "#6b7280",
  },
  selectedBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: 10,
    padding: "12px 16px",
    marginBottom: 20,
  },
  favoriteBtn: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 13,
    cursor: "pointer",
    color: "#d97706",
    fontWeight: 500,
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
    color: "#374151",
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
  sendBtn: {
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
};