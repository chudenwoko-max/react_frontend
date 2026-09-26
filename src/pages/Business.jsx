import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";

export default function Business() {
  const [me, setMe] = useState(null);
  const [amount, setAmount] = useState("500");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("Test");
  const [charges, setCharges] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const [a, b] = await Promise.all([
        axiosClient.get("merchant/me/"),
        axiosClient.get("merchant/charges/"),
      ]);
      setMe(a.data);
      setCharges(Array.isArray(b.data) ? b.data : []);
    } catch (e) {
      setErr(e.response?.data?.detail || e.response?.data?.error || "Failed to load merchant");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createCharge = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await axiosClient.post("merchant/charges/", {
        amount,
        email,
        description,
      });
      const url = res.data?.authorization_url;
      await load();
      if (url) window.location.href = url;
    } catch (e2) {
      setErr(e2.response?.data?.error || "Could not create charge");
    } finally {
      setBusy(false);
    }
  };

  if (!me) return <p style={{ padding: 24 }}>Loading… {err}</p>;

  if (me.status !== "approved") {
    return (
      <div style={{ padding: 24 }}>
        <h1>Business</h1>
        <p>Status: {me.status}. Admin must approve the merchant profile.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 520 }}>
      <h1>{me.business_name || "Business"}</h1>
      <p>Create a Paystack Checkout link. Success credits the merchant ledger.</p>
      {err ? <p style={{ color: "crimson" }}>{err}</p> : null}
      <form onSubmit={createCharge}>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount NGN"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Customer email"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <button type="submit" disabled={busy}>
          {busy ? "Creating…" : "Create payment link"}
        </button>
      </form>
      <h2>Recent</h2>
      <ul>
        {charges.map((c) => (
          <li key={c.id}>
            {c.reference} ₦{c.amount} {c.status}
          </li>
        ))}
      </ul>
    </div>
  );
}