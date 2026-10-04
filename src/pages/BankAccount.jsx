import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function BankAccount() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [banks, setBanks] = useState([]);

  const [form, setForm] = useState({
    bank_name: "",
    bank_code: "",
    account_number: "",
    account_name: "",
  });

  // ================= LOAD ACCOUNT + BANK LIST =================
  useEffect(() => {
    axiosClient
      .get("bank/account/")   // ⭐ FIXED: removed /api/
      .then((res) => {
        if (res.data) {
          setAccount(res.data);
          setForm({
            bank_name: res.data.bank_name || "",
            bank_code: res.data.bank_code || "",
            account_number: res.data.account_number || "",
            account_name: res.data.account_name || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // ⭐ Load banks with correct code
    axiosClient
      .get("banks/")   // ⭐ FIXED: removed /api/
      .then((res) => {
        setBanks(
          (res.data.data || res.data || []).map((b) => ({
            name: b.name,
            code: b.code || b.bank_code || "",
          }))
        );
      })
      .catch(() => toast.error("Failed to load bank list"));
  }, []);

  // ================= FORM CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ⭐ PATCHED BANK SELECT
  const handleBankSelect = (e) => {
    const bank = banks.find((b) => b.name === e.target.value);
    setForm({
      ...form,
      bank_name: bank?.name || "",
      bank_code: bank?.code || bank?.bank_code || "",
    });
  };

  // ================= SAVE =================
  const handleSave = async () => {
  if (saving) return;
  if (!form.bank_name || !form.account_number || !form.account_name) {
    toast.error("Please fill in all fields");
    return;
  }
  if (!form.bank_code) {
    toast.error("Bank code is missing for this bank");
    return;
  }
  if (form.account_number.length !== 10) {
    toast.error("Account number must be 10 digits");
    return;
  }

  setSaving(true);
  try {
    await axiosClient.post("bank/link/", {
      bank_name: form.bank_name,
      bank_code: form.bank_code,
      account_number: form.account_number,
      account_name: form.account_name,
    });
    toast.success("Bank account saved");
    navigate("/");
  } catch (err) {
    toast.error(
      err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to save bank account"
    );
    setSaving(false);
  }
};

  // ================= RENDER =================
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
        Loading bank account...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Bank Account</h1>
        <p style={styles.subtitle}>Add your bank account for withdrawals</p>
      </div>

      <div style={styles.card}>
        {/* Current Account Preview */}
        {account && (
          <div style={styles.previewBox}>
            <p style={styles.previewLabel}>Linked Account</p>
            <h3 style={styles.previewBank}>{account.bank_name}</h3>
            <p style={styles.previewNumber}>{account.account_number}</p>
            <p style={styles.previewName}>{account.account_name}</p>
          </div>
        )}

        {/* ⭐ Bank Dropdown */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Bank Name</label>
          <select
            value={form.bank_name}
            onChange={handleBankSelect}
            style={styles.input}
          >
            <option value="">Select Bank</option>
            {banks.map((b) => (
              <option key={b.code} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Account Number</label>
          <input
            type="text"
            name="account_number"
            value={form.account_number}
            onChange={handleChange}
            placeholder="0123456789"
            maxLength={10}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Account Name</label>
          <input
            type="text"
            name="account_name"
            value={form.account_name}
            onChange={handleChange}
            placeholder="Name as it appears on your account"
            style={styles.input}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            ...styles.saveBtn,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving
            ? "Saving..."
            : account
            ? "Update Bank Account"
            : "Save Bank Account"}
        </button>
      </div>
    </div>
  );
}

// ================= STYLES =================
const styles = {
  page: {
    padding: "32px 28px",
    maxWidth: 520,
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
    padding: "28px",
    border: "1px solid #f3f4f6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  previewBox: {
    background: "linear-gradient(135deg, #1e40af, #3b82f6)",
    color: "white",
    padding: "20px 24px",
    borderRadius: 14,
    marginBottom: 28,
  },
  previewLabel: {
    margin: 0,
    fontSize: 13,
    opacity: 0.85,
  },
  previewBank: {
    margin: "6px 0 4px",
    fontSize: 18,
    fontWeight: 700,
  },
  previewNumber: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    letterSpacing: 1,
  },
  previewName: {
    margin: "4px 0 0",
    fontSize: 14,
    opacity: 0.9,
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
  saveBtn: {
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
