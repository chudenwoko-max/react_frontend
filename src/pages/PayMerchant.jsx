import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";
import { ClearHoldButton } from "../components/ClearHoldButton";
import { isPaymentHoldError } from "../utils/paymentHold";

export default function PayMerchant() {
  const [cards, setCards] = useState([]);
  const [cardId, setCardId] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [merchantQuery, setMerchantQuery] = useState("");
  const [merchantResults, setMerchantResults] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [searching, setSearching] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [showClearHold, setShowClearHold] = useState(false);

  useEffect(() => {
    axiosClient
      .get("me/cards/")
      .then((r) => setCards(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCards([]));
  }, []);

  useEffect(() => {
    if (!merchantQuery || merchantQuery.length < 2 || selectedMerchant) {
      setMerchantResults([]);
      setSearching(false);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axiosClient.get("merchant/search/", {
          params: { q: merchantQuery },
        });
        if (active) {
          setMerchantResults(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        if (active) setMerchantResults([]);
      } finally {
        if (active) setSearching(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [merchantQuery, selectedMerchant]);

  const validateCommon = () => {
    if (!merchantId.trim()) {
      toast.error("Select a business");
      return false;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return false;
    }
    return true;
  };

  const payWallet = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!validateCommon()) return;
    if (pin.length !== 4) {
      toast.error("Enter your 4-digit transfer PIN");
      return;
    }

    setBusy(true);
    setShowClearHold(false);

    try {
      const verified = await axiosClient.post("verify-pin/", { pin: String(pin) });
      const pinToken = verified.data?.pin_token || verified.data?.token || "";
      if (!pinToken) {
        toast.error("Could not verify PIN");
        setBusy(false);
        return;
      }

      const idem = sessionStorage.getItem("pay_idem") || crypto.randomUUID();
      sessionStorage.setItem("pay_idem", idem);

      await axiosClient.post(
        "merchant/pay-wallet/",
        {
          merchant_id: Number(merchantId),
          amount,
          description: description || "Wallet payment",
          pin,
          pin_token: pinToken,
        },
        { headers: { "Idempotency-Key": idem } }
      );

      sessionStorage.removeItem("pay_idem");
      toast.success("Paid from wallet");
      window.location.href = "/dashboard";
    } catch (err) {
      setShowClearHold(isPaymentHoldError(err));
      sessionStorage.removeItem("pay_idem");
      toast.error(err.response?.data?.error || err.response?.data?.detail || "Wallet pay failed");
      setBusy(false);
    }
  };

  const payCard = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!validateCommon()) return;
    if (pin.length !== 4) {
      toast.error("Enter your 4-digit transfer PIN");
      return;
    }
    if (!cardId) {
      toast.error("Select a saved card");
      return;
    }

    setBusy(true);
    setShowClearHold(false);

    try {
      const verified = await axiosClient.post("verify-pin/", { pin: String(pin) });
      const pinToken = verified.data?.pin_token || verified.data?.token || "";
      if (!pinToken) {
        toast.error("Could not verify PIN");
        setBusy(false);
        return;
      }

      await axiosClient.post("merchant/pay-card/", {
        merchant_id: Number(merchantId),
        card_id: Number(cardId),
        amount,
        description: description || "Card payment",
        pin,
        pin_token: pinToken,
      });
      toast.success("Paid with saved card");
      window.location.href = "/dashboard";
    } catch (err) {
      setShowClearHold(isPaymentHoldError(err));
      toast.error(err.response?.data?.error || err.response?.data?.detail || "Card pay failed");
      setBusy(false);
    }
  };

  const addCardCheckout = async () => {
    if (busy) return;
    if (!validateCommon()) return;
    if (pin.length !== 4) {
      toast.error("Enter your 4-digit transfer PIN");
      return;
    }

    setBusy(true);
    setShowClearHold(false);

    try {
      const verified = await axiosClient.post("verify-pin/", { pin: String(pin) });
      const pinToken = verified.data?.pin_token || verified.data?.token || "";
      if (!pinToken) {
        toast.error("Could not verify PIN");
        setBusy(false);
        return;
      }

      const res = await axiosClient.post("merchant/pay-checkout/", {
        merchant_id: Number(merchantId),
        amount,
        description: description || "Save card + pay",
        pin,
        pin_token: pinToken,
      });
      const url = res.data?.authorization_url;
      if (!url) throw new Error("No checkout URL");
      window.location.href = url;
    } catch (err) {
      setShowClearHold(isPaymentHoldError(err));
      toast.error(err.response?.data?.error || err.response?.data?.detail || "Checkout failed");
      setBusy(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Pay a business</h1>
        <p style={styles.subtitle}>Pay a merchant from your wallet or card</p>
      </div>

      <div style={styles.card}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Business</label>
          <input
            value={selectedMerchant ? selectedMerchant.business_name : merchantQuery}
            onChange={(e) => {
              setSelectedMerchant(null);
              setMerchantId("");
              setMerchantQuery(e.target.value);
            }}
            placeholder="Search business name"
            style={styles.input}
          />
          {searching && (
            <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>
              Searching…
            </p>
          )}

          {merchantResults.length > 0 && !selectedMerchant && (
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                marginTop: 4,
                background: "#fff",
                maxHeight: 200,
                overflowY: "auto",
              }}
            >
              {merchantResults.map((merchant) => (
                <div
                  key={merchant.id}
                  onClick={() => {
                    setSelectedMerchant(merchant);
                    setMerchantId(String(merchant.id));
                    setMerchantQuery(merchant.business_name);
                    setMerchantResults([]);
                  }}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f3f4f6",
                    fontSize: 14,
                  }}
                >
                  {merchant.business_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Amount (NGN)</label>
          <div style={styles.amountWrapper}>
            <span style={styles.currency}>₦</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.amountInput}
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description (optional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this payment for?"
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Transfer PIN (4 digits)</label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            style={styles.input}
          />
        </div>

        <button
          type="button"
          onClick={payWallet}
          disabled={busy}
          style={styles.primaryBtn}
        >
          {busy ? "Paying…" : "Pay with wallet"}
        </button>

        <div style={{ margin: "28px 0", borderTop: "1px solid #f3f4f6" }} />

        <div style={styles.formGroup}>
          <label style={styles.label}>Saved card</label>
          <select
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            style={styles.input}
          >
            <option value="">Select a card</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {(c.brand || "Card") + " •••• " + (c.last4 || "")}
              </option>
            ))}
          </select>
          {cards.length === 0 && (
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
              No saved cards yet.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={payCard}
          disabled={busy || !cardId}
          style={{ ...styles.secondaryBtn, opacity: !cardId ? 0.6 : 1 }}
        >
          {busy ? "Paying…" : "Pay with saved card"}
        </button>

        <button
          type="button"
          onClick={addCardCheckout}
          disabled={busy}
          style={{ ...styles.secondaryBtn, marginTop: 12 }}
        >
          {busy ? "Redirecting…" : "Pay with new card (Paystack)"}
        </button>

        {showClearHold && (
          <div style={{ marginTop: 20 }}>
            <ClearHoldButton onCleared={() => setShowClearHold(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "32px 28px",
    maxWidth: 480,
    margin: "0 auto",
  },
  header: { marginBottom: 24 },
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
    padding: "28px",
    border: "1px solid #f3f4f6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  formGroup: { marginBottom: 18 },
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
    boxSizing: "border-box",
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
  secondaryBtn: {
    width: "100%",
    padding: "13px",
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
  },
};