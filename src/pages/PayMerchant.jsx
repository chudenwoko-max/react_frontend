import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function PayMerchant() {
  const [cards, setCards] = useState([]);
  const [cardId, setCardId] = useState("");
  const [merchantId, setMerchantId] = useState("1");
  const [amount, setAmount] = useState("500");
  const [description, setDescription] = useState("Wallet pay");
  const [pin, setPin] = useState("");
  const [pinToken, setPinToken] = useState(
    () => localStorage.getItem("pin_token") || ""
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

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
    if (!pin) {
      toast.error("Enter your transfer PIN");
      return;
    }
    if (!pinToken) {
      toast.error("PIN token missing. Open Send once so a token is created.");
      return;
    }
    setBusy(true);
    try {
      await axiosClient.post("merchant/pay-wallet/", {
        merchant_id: Number(merchantId),
        amount,
        description,
        pin,
        pin_token: pinToken,
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

  const addCardCheckout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await axiosClient.post("merchant/pay-checkout/", {
        merchant_id: Number(merchantId),
        amount,
        description: "Save card + pay",
      });
      const url = res.data?.authorization_url;
      if (!url) throw new Error("No checkout URL");
      window.location.href = url;
    } catch (err) {
      setMsg(err.response?.data?.error || err.message || "Checkout failed");
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
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label>Transfer PIN</label>
      <input
        type="password"
        inputMode="numeric"
        autoComplete="off"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label>PIN token</label>
      <input
        value={pinToken}
        onChange={(e) => setPinToken(e.target.value)}
        placeholder="From Send / create-pin"
        style={{ width: "100%", marginBottom: 16 }}
      />

      <button
        type="button"
        onClick={payWallet}
        disabled={busy}
        style={{ width: "100%", marginBottom: 24 }}
      >
        {busy ? "Paying…" : "Pay with wallet"}
      </button>

      <button
        type="button"
        onClick={addCardCheckout}
        disabled={busy}
        style={{ width: "100%", marginBottom: 24 }}
      >
        {busy ? "Redirecting…" : "Pay with card (Paystack test)"}
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

      <button
        type="button"
        onClick={payCard}
        disabled={busy || !cardId}
        style={{ width: "100%" }}
      >
        {busy ? "Paying…" : "Pay with saved card"}
      </button>

      {msg && (
        <p style={{ marginTop: 12, color: "red", fontSize: 14 }}>
          {msg}
        </p>
      )}
    </div>
  );
}