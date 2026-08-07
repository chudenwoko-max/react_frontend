import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

const NETWORKS = [
  { id: "MTN", name: "MTN", color: "#ffcc00" },
  { id: "GLO", name: "Glo", color: "#00a86b" },
  { id: "AIRTEL", name: "Airtel", color: "#ed1c24" },
  { id: "9MOBILE", name: "9mobile", color: "#006f3c" },
];

const DATA_PLANS = {
  MTN: [
    { name: "1GB - 1 Day", amount: 500 },
    { name: "2GB - 30 Days", amount: 1200 },
    { name: "5GB - 30 Days", amount: 2500 },
    { name: "10GB - 30 Days", amount: 4500 },
  ],
  GLO: [
    { name: "1.5GB - 1 Day", amount: 500 },
    { name: "3GB - 30 Days", amount: 1500 },
    { name: "6GB - 30 Days", amount: 2500 },
    { name: "12GB - 30 Days", amount: 5000 },
  ],
  AIRTEL: [
    { name: "1GB - 1 Day", amount: 500 },
    { name: "2GB - 30 Days", amount: 1200 },
    { name: "5GB - 30 Days", amount: 2500 },
    { name: "10GB - 30 Days", amount: 4000 },
  ],
  "9MOBILE": [
    { name: "1GB - 1 Day", amount: 500 },
    { name: "2.5GB - 30 Days", amount: 1500 },
    { name: "5GB - 30 Days", amount: 2500 },
    { name: "11GB - 30 Days", amount: 4000 },
  ],
};

const ELECTRICITY_PROVIDERS = [
  "Ikeja Electric",
  "Eko Electricity",
  "Abuja Electricity",
  "Kano Electricity",
  "Port Harcourt Electric",
  "Ibadan Electricity",
];

const CABLE_PROVIDERS = [
  {
    id: "DSTV",
    name: "DSTV",
    packages: [
      { name: "DStv Padi", amount: 2950 },
      { name: "DStv Yanga", amount: 4200 },
      { name: "DStv Confam", amount: 7400 },
      { name: "DStv Compact", amount: 15700 },
      { name: "DStv Compact Plus", amount: 25000 },
      { name: "DStv Premium", amount: 37000 },
    ],
  },
  {
    id: "GOTV",
    name: "GOtv",
    packages: [
      { name: "GOtv Smallie", amount: 1575 },
      { name: "GOtv Jinja", amount: 2700 },
      { name: "GOtv Jolli", amount: 3800 },
      { name: "GOtv Max", amount: 5700 },
      { name: "GOtv Supa", amount: 8600 },
    ],
  },
  {
    id: "STARTIMES",
    name: "Startimes",
    packages: [
      { name: "Nova", amount: 1200 },
      { name: "Basic", amount: 2100 },
      { name: "Smart", amount: 2800 },
      { name: "Classic", amount: 3500 },
      { name: "Super", amount: 6000 },
    ],
  },
];

export default function BillPayments() {
  const [activeTab, setActiveTab] = useState("airtime");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Airtime & Data
  const [provider, setProvider] = useState("MTN");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Electricity
  const [disco, setDisco] = useState("Ikeja Electric");
  const [meterNumber, setMeterNumber] = useState("");
  const [meterType, setMeterType] = useState("prepaid");
  const [elecAmount, setElecAmount] = useState("");

  // Cable
  const [cableProvider, setCableProvider] = useState("DSTV");
  const [smartcard, setSmartcard] = useState("");
  const [cablePackage, setCablePackage] = useState(null);

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      const res = await axiosClient.get("/bills/history/");
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyAirtime = async () => {
    if (!phone || phone.length < 10) return toast.error("Enter a valid phone number");
    if (!amount || Number(amount) < 50) return toast.error("Minimum amount is ₦50");

    setLoading(true);
    try {
      await axiosClient.post("/bills/airtime/", { provider, phone, amount });
      toast.success(`Airtime of ₦${amount} sent successfully`);
      setAmount("");
      setPhone("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyData = async () => {
    if (!phone || phone.length < 10) return toast.error("Enter a valid phone number");
    if (!selectedPlan) return toast.error("Please select a data plan");

    setLoading(true);
    try {
      await axiosClient.post("/bills/data/", {
        provider,
        phone,
        amount: selectedPlan.amount,
        package_name: selectedPlan.name,
      });
      toast.success(`${selectedPlan.name} purchased successfully`);
      setSelectedPlan(null);
      setPhone("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePayElectricity = async () => {
    if (!meterNumber) return toast.error("Enter meter number");
    if (!elecAmount || Number(elecAmount) < 500) return toast.error("Minimum amount is ₦500");

    setLoading(true);
    try {
      await axiosClient.post("/bills/electricity/", {
        provider: disco,
        meter_number: meterNumber,
        amount: elecAmount,
        meter_type: meterType,
      });
      toast.success("Electricity payment successful");
      setMeterNumber("");
      setElecAmount("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePayCable = async () => {
    if (!smartcard) return toast.error("Enter smartcard number");
    if (!cablePackage) return toast.error("Please select a package");

    setLoading(true);
    try {
      await axiosClient.post("/bills/cable/", {
        provider: cableProvider,
        smartcard_number: smartcard,
        amount: cablePackage.amount,
        package_name: cablePackage.name,
      });
      toast.success(`${cablePackage.name} subscription successful`);
      setSmartcard("");
      setCablePackage(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const currentCablePackages =
    CABLE_PROVIDERS.find((p) => p.id === cableProvider)?.packages || [];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Bill Payments</h1>
        <p style={styles.subtitle}>Airtime, Data, Electricity & Cable TV</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {["airtime", "data", "electricity", "cable", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              background: activeTab === tab ? "#2563eb" : "transparent",
              color: activeTab === tab ? "white" : "#6b7280",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.card}>
        {/* ===== AIRTIME ===== */}
        {activeTab === "airtime" && (
          <div>
            <label style={styles.label}>Select Network</label>
            <div style={styles.providerGrid}>
              {NETWORKS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  style={{
                    ...styles.providerBtn,
                    borderColor: provider === p.id ? p.color : "#e5e7eb",
                    background: provider === p.id ? `${p.color}18` : "white",
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                placeholder="0801 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={styles.input}
              />
            </div>

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

            <div style={styles.quickGrid}>
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  style={{
                    ...styles.quickBtn,
                    background: amount === amt.toString() ? "#eff6ff" : "#f9fafb",
                    borderColor: amount === amt.toString() ? "#2563eb" : "#e5e7eb",
                    color: amount === amt.toString() ? "#2563eb" : "#374151",
                  }}
                >
                  ₦{amt}
                </button>
              ))}
            </div>

            <button onClick={handleBuyAirtime} disabled={loading} style={styles.primaryBtn}>
              {loading ? "Processing..." : "Buy Airtime"}
            </button>
          </div>
        )}

        {/* ===== DATA ===== */}
        {activeTab === "data" && (
          <div>
            <label style={styles.label}>Select Network</label>
            <div style={styles.providerGrid}>
              {NETWORKS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setProvider(p.id);
                    setSelectedPlan(null);
                  }}
                  style={{
                    ...styles.providerBtn,
                    borderColor: provider === p.id ? p.color : "#e5e7eb",
                    background: provider === p.id ? `${p.color}18` : "white",
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                placeholder="0801 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={styles.input}
              />
            </div>

            <label style={styles.label}>Select Data Plan</label>
            <div style={styles.plansGrid}>
              {(DATA_PLANS[provider] || []).map((plan, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedPlan(plan)}
                  style={{
                    ...styles.planCard,
                    borderColor: selectedPlan?.name === plan.name ? "#2563eb" : "#e5e7eb",
                    background: selectedPlan?.name === plan.name ? "#eff6ff" : "white",
                  }}
                >
                  <p style={styles.planName}>{plan.name}</p>
                  <p style={styles.planAmount}>₦{plan.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <button onClick={handleBuyData} disabled={loading} style={styles.primaryBtn}>
              {loading ? "Processing..." : "Buy Data"}
            </button>
          </div>
        )}

        {/* ===== ELECTRICITY ===== */}
        {activeTab === "electricity" && (
          <div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Electricity Provider (Disco)</label>
              <select
                value={disco}
                onChange={(e) => setDisco(e.target.value)}
                style={styles.input}
              >
                {ELECTRICITY_PROVIDERS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Meter Type</label>
              <div style={{ display: "flex", gap: 10 }}>
                {["prepaid", "postpaid"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setMeterType(type)}
                    style={{
                      ...styles.quickBtn,
                      flex: 1,
                      background: meterType === type ? "#eff6ff" : "#f9fafb",
                      borderColor: meterType === type ? "#2563eb" : "#e5e7eb",
                      color: meterType === type ? "#2563eb" : "#374151",
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Meter Number</label>
              <input
                type="text"
                placeholder="Enter meter number"
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Amount</label>
              <div style={styles.amountWrapper}>
                <span style={styles.currency}>₦</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={elecAmount}
                  onChange={(e) => setElecAmount(e.target.value)}
                  style={styles.amountInput}
                />
              </div>
            </div>

            <button onClick={handlePayElectricity} disabled={loading} style={styles.primaryBtn}>
              {loading ? "Processing..." : "Pay Electricity"}
            </button>
          </div>
        )}

        {/* ===== CABLE TV ===== */}
        {activeTab === "cable" && (
          <div>
            <label style={styles.label}>Select Provider</label>
            <div style={styles.providerGrid}>
              {CABLE_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setCableProvider(p.id);
                    setCablePackage(null);
                  }}
                  style={{
                    ...styles.providerBtn,
                    borderColor: cableProvider === p.id ? "#2563eb" : "#e5e7eb",
                    background: cableProvider === p.id ? "#eff6ff" : "white",
                    color: cableProvider === p.id ? "#2563eb" : "#374151",
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Smartcard / IUC Number</label>
              <input
                type="text"
                placeholder="Enter smartcard number"
                value={smartcard}
                onChange={(e) => setSmartcard(e.target.value)}
                style={styles.input}
              />
            </div>

            <label style={styles.label}>Select Package</label>
            <div style={styles.plansGrid}>
              {currentCablePackages.map((pkg, i) => (
                <div
                  key={i}
                  onClick={() => setCablePackage(pkg)}
                  style={{
                    ...styles.planCard,
                    borderColor: cablePackage?.name === pkg.name ? "#2563eb" : "#e5e7eb",
                    background: cablePackage?.name === pkg.name ? "#eff6ff" : "white",
                  }}
                >
                  <p style={styles.planName}>{pkg.name}</p>
                  <p style={styles.planAmount}>₦{pkg.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <button onClick={handlePayCable} disabled={loading} style={styles.primaryBtn}>
              {loading ? "Processing..." : "Pay Subscription"}
            </button>
          </div>
        )}

        {/* ===== HISTORY ===== */}
        {activeTab === "history" && (
          <div>
            {history.length === 0 ? (
              <p style={styles.empty}>No bill payments yet</p>
            ) : (
              history.map((bill) => (
                <div key={bill.id} style={styles.historyItem}>
                  <div>
                    <p style={styles.historyTitle}>
                      {bill.bill_type.toUpperCase()} • {bill.provider}
                    </p>
                    <p style={styles.historySub}>{bill.customer_id}</p>
                    {bill.package_name && (
                      <p style={styles.historySub}>{bill.package_name}</p>
                    )}
                    <p style={styles.historyDate}>{bill.created_at}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={styles.historyAmount}>
                      ₦{Number(bill.amount).toLocaleString()}
                    </p>
                    <span
                      style={{
                        ...styles.badge,
                        background: bill.status === "successful" ? "#dcfce7" : "#fee2e2",
                        color: bill.status === "successful" ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {bill.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ================= STYLES =================
const styles = {
  page: { padding: "32px 28px", maxWidth: 580, margin: "0 auto" },
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 700, color: "#111827", margin: 0 },
  subtitle: { color: "#6b7280", marginTop: 4, fontSize: 14 },
  tabs: {
    display: "flex",
    gap: 6,
    marginBottom: 20,
    background: "#f3f4f6",
    padding: 4,
    borderRadius: 12,
    overflowX: "auto",
  },
  tab: {
    flex: 1,
    padding: "10px 6px",
    border: "none",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  card: {
    background: "white",
    borderRadius: 16,
    padding: "24px",
    border: "1px solid #f3f4f6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 8,
  },
  providerGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: 10,
    marginBottom: 20,
  },
  providerBtn: {
    padding: "12px 6px",
    borderRadius: 10,
    border: "2px solid",
    background: "white",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  formGroup: { marginBottom: 16 },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 15,
    outline: "none",
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
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    marginBottom: 24,
  },
  quickBtn: {
    padding: "10px",
    borderRadius: 10,
    border: "1px solid",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  plansGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 24,
  },
  planCard: {
    padding: "14px",
    borderRadius: 12,
    border: "1.5px solid",
    cursor: "pointer",
  },
  planName: { margin: 0, fontSize: 13, fontWeight: 500, color: "#374151" },
  planAmount: { margin: "6px 0 0", fontSize: 16, fontWeight: 700, color: "#111827" },
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
  },
  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  historyTitle: { margin: 0, fontWeight: 600, fontSize: 14 },
  historySub: { margin: "3px 0 0", fontSize: 13, color: "#6b7280" },
  historyDate: { margin: "4px 0 0", fontSize: 12, color: "#9ca3af" },
  historyAmount: { margin: 0, fontWeight: 700, fontSize: 15 },
  badge: {
    display: "inline-block",
    marginTop: 6,
    padding: "3px 8px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  empty: { textAlign: "center", color: "#9ca3af", padding: "40px 0" },
};