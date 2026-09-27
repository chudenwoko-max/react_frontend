import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function PayMerchant() {
  const [cards, setCards] = useState([]);
  const [cardId, setCardId] = useState("");
  const [merchantId, setMerchantId] = useState("1");
  const [amount, setAmount] = useState("500");
  const [description, setDescription] = useState("Wallet pay");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    axiosClient
      .get("me/cards/")
      .then((r) => setCards(Array.isArray(r.data) ? r.data : []))
      .catch(() => {
        setCards([]);
      });
  }, []);

  const payWallet = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await axiosClient.post("merchant/pay-wallet/", {
        merchant_id: Number(merchantId),
        amount,
        description,
      });
      toast.success("Paid from wallet");
      window.location.replace("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Wallet pay failed");
      setBusy(false);
    }
  };

  const payCard = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!cardId) {
      toast.error("Select a saved card or pay once via Collect first");
      return;
    }
    setBusy(true);
    try {
      await axiosClient.post("merchant/pay-card/", {
        merchant_id: Number(merchantId),
        card_id: Number(cardId),
        amount,
        description,
      });
      toast.success("Paid with saved card");
      window.location.replace("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Card pay failed");
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 420, fontFamily: "system-ui" }}>
      <h1>Pay a business</h1>
      <p>Use another user, not the shop owner. Merchant 1 is Test Shop.</p>

      <label>Merchant id</label>
      <input
        value={merchantId}
        onChange={(e) => setMerchantId(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label>Amount (NGN)</label>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label>Description</label>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ width: "100%", marginBottom: 16 }}
      />

      <button type="button" onClick={payWallet} disabled={busy} style={{ width: "100%", marginBottom: 24 }}>
        {busy ? "Paying…" : "Pay with wallet"}
      </button>

      <label>Saved card</label>
      <select
        value={cardId}
        onChange={(e) => setCardId(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      >
        <option value="">Select</option>
        {cards.map((c) => (
          <option key={c.id} value={c.id}>
            {(c.brand || "Card") + " •••• " + (c.last4 || "")}
          </option>
        ))}
      </select>
      {cards.length === 0 && (
        <p style={{ color: "#64748b", fontSize: 14 }}>
          No saved card. Pay once via Business → Collect with a test card while logged in.
        </p>
      )}

      <button type="button" onClick={payCard} disabled={busy || !cardId} style={{ width: "100%" }}>
        {busy ? "Paying…" : "Pay with saved card"}
      </button>
    </div>
  );
}