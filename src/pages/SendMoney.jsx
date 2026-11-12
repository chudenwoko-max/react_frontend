import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

import FavoriteRecipients from "../components/FavoriteRecipients";
import AddFavoriteModal from "../components/AddFavoriteModal";
import { ClearHoldButton } from "../components/ClearHoldButton";
import { isPaymentHoldError } from "../utils/paymentHold";

export default function SendMoney() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [showClearHold, setShowClearHold] = useState(false);
  const [limits, setLimits] = useState(null);
  const [pin, setPin] = useState("");

  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [lastRecipient, setLastRecipient] = useState("");

  useEffect(() => {
    axiosClient
      .get("limits/")
      .then((res) => setLimits(res.data))
      .catch((err) => console.error("Could not load transfer limits:", err));
  }, [location.key]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    axiosClient
      .get(`users/search/?q=${encodeURIComponent(value)}`)
      .then((res) => setResults(res.data.results || res.data))
      .catch(() => setResults([]));
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (busy) return;

    if (!selectedUser) {
      toast.error("Select a recipient first");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      toast.error("Enter your 4-digit transfer PIN");
      return;
    }

    const reference =
      sessionStorage.getItem("send_idem") || crypto.randomUUID();
    sessionStorage.setItem("send_idem", reference);

    setBusy(true);
    setShowClearHold(false);

    try {
      const pinRes = await axiosClient.post("verify-pin/", { pin });
      const pinToken = pinRes.data?.pin_token;
      if (!pinToken) {
        toast.error("Could not verify transfer PIN");
        setBusy(false);
        return;
      }

      await axiosClient.post(
        "send-money/",
        {
          recipient: selectedUser.username,
          amount,
          pin,
          pin_token: pinToken,
          idempotency_key: reference,
        },
        {
          headers: { "Idempotency-Key": reference },
        }
      );

      sessionStorage.removeItem("send_idem");
      toast.success("Transfer successful");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (isPaymentHoldError(err)) setShowClearHold(true);
      toast.error(err.response?.data?.error || "Transfer failed");
      setBusy(false);
    }
  };


  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Send Money</h1>
        <p style={styles.subtitle}>Transfer funds to friends and family instantly</p>
        {limits && (
          <p>
            Limit ₦{Number(limits.per_send_limit).toLocaleString()} per send · ₦
            {Number(limits.remaining_today).toLocaleString()} left today
          </p>
        )}
      </div>

      <div style={styles.card}>
        <div style={{ marginBottom: 24 }}>
          <FavoriteRecipients
            onSelect={(fav) => {
              setSelectedUser(fav.recipient);
              setSearch(fav.recipient.username);
              setResults([]);
            }}
          />
        </div>

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

        <form onSubmit={handleSend}>
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
            <label htmlFor="transfer-pin" style={styles.label}>
              Enter transfer PIN
            </label>
            <input
              id="transfer-pin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={busy} style={styles.sendBtn}>
            {busy ? "Sending..." : "Continue"}
          </button>
        </form>
        {showClearHold && (
          <ClearHoldButton onCleared={() => setShowClearHold(false)} />
        )}
      </div>

      <AddFavoriteModal
        open={showFavoriteModal}
        onClose={() => setShowFavoriteModal(false)}
        recipientUsername={lastRecipient}
      />

    </div>
  );
}

const styles = {
  page: { padding: "32px 28px", maxWidth: 560, margin: "0 auto" },
  header: { marginBottom: 28 },
  title: { fontSize: 26, fontWeight: 700, color: "#111827", margin: 0 },
  subtitle: { color: "#6b7280", marginTop: 4, fontSize: 14 },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: "28px 28px",
    border: "1px solid #f3f4f6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  formGroup: { marginBottom: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 15,
    outline: "none",
  },
  resultsBox: { background: "#f9fafb", borderRadius: 10, marginBottom: 16, overflow: "hidden" },
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
  resultName: { margin: 0, fontWeight: 600, fontSize: 14, color: "#111827" },
  resultEmail: { margin: "2px 0 0", fontSize: 12, color: "#6b7280" },
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