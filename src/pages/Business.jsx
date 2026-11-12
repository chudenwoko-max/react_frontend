import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";

const tabs = ["Overview", "Collect", "Payouts"];

const countries = [
  { code: "NG", dial: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "GH", dial: "+233", name: "Ghana", flag: "🇬🇭" },
  { code: "KE", dial: "+254", name: "Kenya", flag: "🇰🇪" },
  { code: "ZA", dial: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "US", dial: "+1", name: "United States", flag: "🇺🇸" },
  { code: "GB", dial: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", dial: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "IN", dial: "+91", name: "India", flag: "🇮🇳" },
  { code: "CN", dial: "+86", name: "China", flag: "🇨🇳" },
  { code: "DE", dial: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "FR", dial: "+33", name: "France", flag: "🇫🇷" },
  { code: "AE", dial: "+971", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", dial: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AU", dial: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "BR", dial: "+55", name: "Brazil", flag: "🇧🇷" },
];

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
  const [country, setCountry] = useState(countries[0]);
  const [phoneLocal, setPhoneLocal] = useState("");

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

  const fullPhone = `${country.dial}${phoneLocal.replace(/\D/g, "")}`;

  const apply = async (e) => {
    e.preventDefault();
    if (!phoneLocal || phoneLocal.replace(/\D/g, "").length < 7) {
      setErr("Enter a valid phone number");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const res = await axiosClient.put("merchant/apply/", {
        business_name: applyName,
        phone: fullPhone,
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
        <h1 style={{ marginBottom: 8 }}>Business</h1>
        <p style={{ marginBottom: 16 }}>
          Status: <strong>{me.status}</strong>
        </p>
        {me.rejection_reason ? <p style={danger}>{me.rejection_reason}</p> : null}
        {me.can_apply ? (
          <form onSubmit={apply} style={col}>
            <input
              placeholder="Business name"
              value={applyName}
              onChange={(e) => setApplyName(e.target.value)}
              required
              style={input}
            />

            <div style={phoneRow}>
              <select
                value={country.code}
                onChange={(e) => {
                  const selected = countries.find((c) => c.code === e.target.value);
                  if (selected) setCountry(selected);
                }}
                style={countrySelect}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.dial}
                  </option>
                ))}
              </select>
              <input
                placeholder="Phone number"
                value={phoneLocal}
                onChange={(e) => setPhoneLocal(e.target.value.replace(/[^\d]/g, ""))}
                style={{ ...input, flex: 1 }}
                inputMode="numeric"
              />
            </div>
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
              Full number: {fullPhone || country.dial}
            </p>

            <button type="submit" disabled={busy} style={btn}>
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
      <h1 style={{ marginBottom: 4 }}>{me.business_name || "Business"}</h1>
      <p style={{ color: "#64748b", marginBottom: 16 }}>
        Paystack test mode · Collect now · Payouts blocked on Starter
      </p>

      <div style={tabBar}>
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              ...tabBtn,
              fontWeight: tab === t ? 700 : 500,
              borderBottom: tab === t ? "2px solid #0f172a" : "2px solid transparent",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {err ? <p style={danger}>{err}</p> : null}

      {tab === "Overview" && (
        <section>
          <p style={kpi}>₦{payout?.available ?? "0.00"}</p>
          <p style={{ color: "#64748b", marginTop: 0 }}>Available to settle</p>
          <p style={{ marginTop: 16 }}>Charges: {charges.length}</p>
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            {charges.slice(0, 8).map((c) => (
              <li key={c.id} style={{ marginBottom: 4 }}>
                {c.reference} · ₦{c.amount} · {c.status}
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "Collect" && (
        <form onSubmit={createCharge} style={col}>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount NGN"
            style={input}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Customer email"
            type="email"
            style={input}
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this for?"
            style={input}
          />
          <button type="submit" disabled={busy} style={btn}>
            {busy ? "Opening Paystack…" : "Create payment link"}
          </button>
        </form>
      )}

      {tab === "Payouts" && (
        <form onSubmit={sendPayout} style={col}>
          <p style={{ margin: "4px 0" }}>
            Bank: {payout?.settlement_bank_name || "not set"}
          </p>
          <p style={{ margin: "4px 0 12px" }}>
            Account: {payout?.settlement_account_number || "not set"}
          </p>
          <input
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            placeholder="Payout amount"
            style={input}
          />
          <button type="submit" disabled={busy} style={btn}>
            {busy ? "Sending…" : "Request settlement"}
          </button>
        </form>
      )}
    </div>
  );
}

const wrap = {
  padding: 24,
  maxWidth: 560,
  fontFamily: "system-ui, sans-serif",
  margin: "0 auto",
};
const col = { display: "flex", flexDirection: "column", gap: 12 };
const danger = { color: "#b91c1c", marginTop: 12 };
const kpi = { fontSize: 32, fontWeight: 700, margin: "8px 0 0" };
const input = {
  padding: "10px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  fontSize: 14,
};
const btn = {
  padding: "10px 16px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
};
const tabBar = {
  display: "flex",
  gap: 4,
  borderBottom: "1px solid #e2e8f0",
  marginBottom: 20,
};
const tabBtn = {
  background: "none",
  border: "none",
  padding: "8px 12px",
  cursor: "pointer",
  fontSize: 14,
};
const phoneRow = {
  display: "flex",
  gap: 8,
  alignItems: "center",
};
const countrySelect = {
  padding: "10px 8px",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  fontSize: 14,
  background: "#fff",
  minWidth: 110,
};