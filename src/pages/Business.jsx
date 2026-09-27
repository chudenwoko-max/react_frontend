import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";

const tabs = ["Overview", "Collect", "Payouts"];

export default function Business() {
  const [tab, setTab] = useState("Overview");
  const [me, setMe] = useState(null);
  const [payout, setPayout] = useState(null);
  const [charges, setCharges] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState("500");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("Payhost test");
  const [payoutAmount, setPayoutAmount] = useState("500");
  const [applyName, setApplyName] = useState("");
  const [applyPhone, setApplyPhone] = useState("");

  const load = async () => {
    setErr("");
    try {
      const [m, c, p] = await Promise.all([
        axiosClient.get("merchant/me/"),
        axiosClient.get("merchant/charges/").catch(() => ({ data: [] })),
        axiosClient.get("merchant/payout/").catch(() => ({ data: null })),
      ]);
      setMe(m.data);
      setCharges(Array.isArray(c.data) ? c.data : []);
      setPayout(p.data);
    } catch (e) {
      setErr(e.response?.data?.detail || e.response?.data?.error || "Could not load business");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const apply = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await axiosClient.put("merchant/apply/", {
        business_name: applyName,
        phone: applyPhone,
      });
      setMe(res.data);
    } catch (e2) {
      setErr(e2.response?.data?.error || "Apply failed");
    } finally {
      setBusy(false);
    }
  };

  const createCharge = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await axiosClient.post("merchant/charges/", {
        amount,
        email,
        description,
      });
      await load();
      if (res.data?.authorization_url) {
        window.location.href = res.data.authorization_url;
      }
    } catch (e2) {
      setErr(e2.response?.data?.error || "Could not create payment");
    } finally {
      setBusy(false);
    }
  };

  const sendPayout = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await axiosClient.post("merchant/payout/", {
        amount: payoutAmount,
      });
      await load();
      setErr(res.data?.error || "Payout requested");
    } catch (e2) {
      setErr(e2.response?.data?.error || "Payout failed (expected on Paystack Starter)");
    } finally {
      setBusy(false);
    }
  };

  if (!me) {
    return (
      <div style={wrap}>
        <p>Loading business…</p>
        {err ? <p style={danger}>{err}</p> : null}
      </div>
    );
  }

  if (me.status !== "approved") {
    return (
      <div style={wrap}>
        <h1>Business</h1>
        <p>Status: <b>{me.status}</b></p>
        {me.rejection_reason ? <p style={danger}>{me.rejection_reason}</p> : null}
        {me.can_apply ? (
          <form onSubmit={apply} style={col}>
            <input
              placeholder="Business name"
              value={applyName}
              onChange={(e) => setApplyName(e.target.value)}
              required
            />
            <input
              placeholder="Phone"
              value={applyPhone}
              onChange={(e) => setApplyPhone(e.target.value)}
            />
            <button type="submit" disabled={busy}>
              {busy ? "Submitting…" : "Apply"}
            </button>
          </form>
        ) : (
          <p>Waiting for admin approval.</p>
        )}
        {err ? <p style={danger}>{err}</p> : null}
      </div>
    );
  }

  return (
    <div style={wrap}>
      <h1>{me.business_name || "Business"}</h1>
      <p>Paystack test mode · Collect now · Payouts blocked on Starter</p>
      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{ fontWeight: tab === t ? 700 : 400 }}
          >
            {t}
          </button>
        ))}
      </div>
      {err ? <p style={danger}>{err}</p> : null}

      {tab === "Overview" && (
        <section>
          <p style={kpi}>₦{payout?.available ?? "0.00"}</p>
          <p>Available to settle</p>
          <p>Charges: {charges.length}</p>
          <ul>
            {charges.slice(0, 8).map((c) => (
              <li key={c.id}>
                {c.reference} · ₦{c.amount} · {c.status}
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "Collect" && (
        <form onSubmit={createCharge} style={col}>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount NGN" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Customer email" />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this for?"
          />
          <button type="submit" disabled={busy}>
            {busy ? "Opening Paystack…" : "Create payment link"}
          </button>
        </form>
      )}

      {tab === "Payouts" && (
        <form onSubmit={sendPayout} style={col}>
          <p>Bank code: {payout?.settlement_bank_name || "not set"}</p>
          <p>Account: {payout?.settlement_account_number || "not set"}</p>
          <input
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            placeholder="Payout amount"
          />
          <button type="submit" disabled={busy}>
            {busy ? "Sending…" : "Request settlement"}
          </button>
        </form>
      )}
    </div>
  );
}

const wrap = { padding: 24, maxWidth: 560, fontFamily: "system-ui" };
const col = { display: "flex", flexDirection: "column", gap: 10 };
const danger = { color: "#b91c1c" };
const kpi = { fontSize: 32, fontWeight: 700, margin: "8px 0" };