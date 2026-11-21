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

const businessTypes = [
  { value: "individual", label: "Individual / Sole Proprietor" },
  { value: "business_name", label: "Business Name (CAC)" },
  { value: "limited", label: "Limited Liability Company" },
  { value: "incorporated_trustees", label: "Incorporated Trustees" },
];

const statusColor = {
  approved: { bg: "#f0fdf4", color: "#166534", border: "#86efac" },
  pending: { bg: "#fffbeb", color: "#92400e", border: "#fcd34d" },
  rejected: { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
  suspended: { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
  not_started: { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
};

const Required = () => <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>;

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

  // Apply form state
  const [applyName, setApplyName] = useState("");
  const [businessType, setBusinessType] = useState("individual");
  const [cacNumber, setCacNumber] = useState("");
  const [tin, setTin] = useState("");
  const [directorName, setDirectorName] = useState("");
  const [bvnOrNin, setBvnOrNin] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [address, setAddress] = useState("");
  const [natureOfBusiness, setNatureOfBusiness] = useState("");
  const [cacDocument, setCacDocument] = useState(null);
  const [idDocument, setIdDocument] = useState(null);
  const [addressDocument, setAddressDocument] = useState(null);
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
  const needsCac = businessType !== "individual";

  const isFormValid = () => {
    if (!applyName.trim()) return false;
    if (!directorName.trim()) return false;
    if (!businessEmail.trim()) return false;
    if (!phoneLocal || phoneLocal.replace(/\D/g, "").length < 7) return false;
    if (!address.trim()) return false;
    if (!idDocument) return false;

    if (!/^\d{11}$/.test(bvnOrNin.trim())) return false;

    if (needsCac) {
      if (!/^\d{10,15}$/.test(tin.trim())) return false;
    } else if (tin.trim() && !/^\d{10,15}$/.test(tin.trim())) {
      return false;
    }

    if (needsCac && !cacNumber.trim()) return false;
    if (needsCac && !cacDocument) return false;
    return true;
  };

  const apply = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setErr("Please fill all required fields");
      return;
    }
    setBusy(true);
    setErr("");
    try {const formData = new FormData();
formData.append("business_name", applyName);
formData.append("phone", fullPhone);
formData.append("business_type", businessType);
formData.append("cac_number", needsCac ? cacNumber : "");
formData.append("tin", tin);
formData.append("director_name", directorName);
formData.append("bvn", bvn.trim());          // backend picks bvn || nin
formData.append("nin", nin.trim());
formData.append("business_email", businessEmail);   // ← renamed
formData.append("address", address);
formData.append("nature_of_business", natureOfBusiness);
if (cacDocument) formData.append("cac_document", cacDocument);
if (idDocument) formData.append("id_document", idDocument);
if (addressDocument) formData.append("address_document", addressDocument);

      const res = await axiosClient.put("merchant/apply/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
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
      <div style={styles.page}>
        <p style={{ color: "#6b7280" }}>Loading business…</p>
        {err ? <p style={styles.danger}>{err}</p> : null}
      </div>
    );
  }

  const sc = statusColor[me.status] || statusColor.not_started;

  if (me.status !== "approved") {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Business</h1>
          <span style={{ ...styles.badge, background: sc.bg, color: sc.color, borderColor: sc.border }}>
            {me.status.replace("_", " ")}
          </span>
        </div>

        {me.rejection_reason ? <p style={styles.danger}>{me.rejection_reason}</p> : null}

        {me.can_apply ? (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Apply to collect payments</h2>
            <p style={styles.hint}>
              Fields marked with <span style={{ color: "#dc2626" }}>*</span> are required for CBN compliance.
            </p>
            <form onSubmit={apply} style={styles.form}>
              <div>
                <label style={styles.label}>
                  Business type <Required />
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  style={styles.input}
                  required
                >
                  {businessTypes.map((bt) => (
                    <option key={bt.value} value={bt.value}>
                      {bt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>
                  Business / Trading name <Required />
                </label>
                <input
                  placeholder="As registered or intended trading name"
                  value={applyName}
                  onChange={(e) => setApplyName(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              {needsCac && (
                <div>
                  <label style={styles.label}>
                    CAC registration number <Required />
                  </label>
                  <input
                    placeholder="RC / BN / IT number"
                    value={cacNumber}
                    onChange={(e) => setCacNumber(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>
              )}

              <div>
                <label style={styles.label}>
                  TIN (Tax Identification Number) {needsCac && <Required />}
                </label>
                <input
                  placeholder="FIRS TIN"
                  value={tin}
                  onChange={(e) => setTin(e.target.value.replace(/\D/g, ""))}
                  required={needsCac}
                  maxLength={15}
                  inputMode="numeric"
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>
                  Director / Proprietor full name <Required />
                </label>
                <input
                  placeholder="Full legal name"
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>
                  BVN or NIN <Required />
                </label>
                <input
                  placeholder="11-digit BVN or NIN"
                  value={bvnOrNin}
                  onChange={(e) => setBvnOrNin(e.target.value.replace(/\D/g, ""))}
                  required
                  maxLength={11}
                  style={styles.input}
                  inputMode="numeric"
                />
              </div>

              <div>
                <label style={styles.label}>
                  Business email <Required />
                </label>
                <input
                  type="email"
                  placeholder="you@business.com"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>
                  Phone number <Required />
                </label>
                <div style={styles.phoneRow}>
                  <select
                    value={country.code}
                    onChange={(e) => {
                      const selected = countries.find((c) => c.code === e.target.value);
                      if (selected) setCountry(selected);
                    }}
                    style={styles.countrySelect}
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
                    style={{ ...styles.input, flex: 1 }}
                    inputMode="numeric"
                    required
                  />
                </div>
                <p style={styles.hint}>Full number: {fullPhone || country.dial}</p>
              </div>

              <div>
                <label style={styles.label}>
                  Business address <Required />
                </label>
                <textarea
                  placeholder="Full registered or operating address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={3}
                  style={{ ...styles.input, resize: "vertical" }}
                />
              </div>

              <div>
                <label style={styles.label}>Nature of business</label>
                <input
                  placeholder="What does the business do?"
                  value={natureOfBusiness}
                  onChange={(e) => setNatureOfBusiness(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>
                  CAC Certificate {needsCac && <Required />}
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setCacDocument(e.target.files[0] || null)}
                  style={styles.input}
                  required={needsCac}
                />
                <p style={styles.hint}>PDF or clear photo of CAC certificate / status report</p>
              </div>

              <div>
                <label style={styles.label}>
                  Director / Proprietor ID <Required />
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setIdDocument(e.target.files[0] || null)}
                  style={styles.input}
                  required
                />
                <p style={styles.hint}>NIN slip, passport, driver’s licence or voter’s card</p>
              </div>

              <div>
                <label style={styles.label}>Proof of address</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setAddressDocument(e.target.files[0] || null)}
                  style={styles.input}
                />
                <p style={styles.hint}>
  Utility bill, bank statement, or tenancy agreement (not older than 3 months)
</p>
              </div>

              <button
                type="submit"
                disabled={busy || !isFormValid()}
                style={{
                  ...styles.btn,
                  opacity: busy || !isFormValid() ? 0.6 : 1,
                  cursor: busy || !isFormValid() ? "not-allowed" : "pointer",
                }}
              >
                {busy ? "Submitting…" : "Submit application"}
              </button>
            </form>
          </div>
        ) : (
          <div style={styles.card}>
            <p>Your application is under review. We’ll notify you once it’s approved.</p>
          </div>
        )}
        {err ? <p style={styles.danger}>{err}</p> : null}
      </div>
    );
  }

  const available = Number(payout?.available || 0);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{me.business_name || "My Business"}</h1>
          <p style={styles.subtitle}>Collect payments and manage settlements</p>
        </div>
        <span style={{ ...styles.badge, background: sc.bg, color: sc.color, borderColor: sc.border }}>
          {me.status}
        </span>
      </div>

      <div style={styles.balanceCard}>
        <p style={styles.balanceLabel}>Available to settle</p>
        <h2 style={styles.balanceAmount}>
          ₦{available.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
        <button
          type="button"
          onClick={() => setTab("Payouts")}
          style={styles.balanceBtn}
        >
          Request payout
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total charges</p>
          <h3 style={styles.statValue}>{charges.length}</h3>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Successful</p>
          <h3 style={styles.statValue}>
            {charges.filter((c) => c.status === "success").length}
          </h3>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Pending</p>
          <h3 style={styles.statValue}>
            {charges.filter((c) => c.status === "pending").length}
          </h3>
        </div>
      </div>

      <div style={styles.tabBar}>
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              ...styles.tabBtn,
              ...(tab === t ? styles.tabBtnActive : {}),
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {err ? <p style={styles.danger}>{err}</p> : null}

      {tab === "Overview" && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Recent charges</h3>
          {charges.length === 0 ? (
            <p style={styles.empty}>No charges yet</p>
          ) : (
            charges.slice(0, 8).map((c) => (
              <div key={c.id} style={styles.chargeRow}>
                <div>
                  <p style={styles.chargeRef}>{c.reference}</p>
                  <p style={styles.chargeMeta}>{c.status}</p>
                </div>
                <p style={styles.chargeAmount}>₦{Number(c.amount).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "Collect" && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Create payment link</h3>
          <form onSubmit={createCharge} style={styles.form}>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (NGN)"
              style={styles.input}
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Customer email"
              type="email"
              style={styles.input}
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              style={styles.input}
            />
            <button type="submit" disabled={busy} style={styles.btn}>
              {busy ? "Opening Paystack…" : "Create payment link"}
            </button>
          </form>
        </div>
      )}

      {tab === "Payouts" && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Request settlement</h3>
          <div style={styles.bankInfo}>
            <p>Bank: {payout?.settlement_bank_name || "Not set"}</p>
            <p>Account: {payout?.settlement_account_number || "Not set"}</p>
          </div>
          <form onSubmit={sendPayout} style={styles.form}>
            <input
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              placeholder="Payout amount"
              style={styles.input}
            />
            <button type="submit" disabled={busy} style={styles.btn}>
              {busy ? "Sending…" : "Request settlement"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "32px 28px",
    maxWidth: 720,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    gap: 16,
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
  badge: {
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    textTransform: "capitalize",
    border: "1px solid",
    whiteSpace: "nowrap",
  },
  balanceCard: {
    background: "linear-gradient(135deg, #1e40af, #3b82f6)",
    color: "white",
    borderRadius: 16,
    padding: "28px 24px",
    marginBottom: 20,
    boxShadow: "0 8px 24px rgba(30, 64, 175, 0.2)",
  },
  balanceLabel: {
    margin: 0,
    fontSize: 14,
    opacity: 0.9,
  },
  balanceAmount: {
    margin: "8px 0 16px",
    fontSize: 36,
    fontWeight: 700,
  },
  balanceBtn: {
    background: "white",
    color: "#2563eb",
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    background: "white",
    padding: "16px",
    borderRadius: 12,
    border: "1px solid #f3f4f6",
  },
  statLabel: {
    margin: 0,
    fontSize: 13,
    color: "#6b7280",
  },
  statValue: {
    margin: "6px 0 0",
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
  },
  tabBar: {
    display: "flex",
    gap: 4,
    borderBottom: "1px solid #e5e7eb",
    marginBottom: 20,
  },
  tabBtn: {
    background: "none",
    border: "none",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    color: "#6b7280",
    borderBottom: "2px solid transparent",
  },
  tabBtnActive: {
    color: "#111827",
    fontWeight: 600,
    borderBottom: "2px solid #2563eb",
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: 12,
    border: "1px solid #f3f4f6",
  },
  cardTitle: {
    margin: "0 0 16px",
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 4,
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
  },
  btn: {
    padding: "10px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    marginTop: 8,
  },
  phoneRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  countrySelect: {
    padding: "10px 8px",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 14,
    background: "#fff",
    minWidth: 110,
  },
  hint: {
    fontSize: 12,
    color: "#6b7280",
    margin: "4px 0 0",
  },
  danger: {
    color: "#b91c1c",
    marginTop: 12,
  },
  empty: {
    color: "#9ca3af",
    textAlign: "center",
    padding: 16,
  },
  chargeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  chargeRef: {
    margin: 0,
    fontSize: 13,
    fontWeight: 500,
    color: "#111827",
    wordBreak: "break-all",
  },
  chargeMeta: {
    margin: "2px 0 0",
    fontSize: 12,
    color: "#6b7280",
    textTransform: "capitalize",
  },
  chargeAmount: {
    margin: 0,
    fontWeight: 600,
    fontSize: 14,
    color: "#111827",
  },
  bankInfo: {
    background: "#f8fafc",
    padding: "12px 14px",
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
    color: "#374151",
  },
};