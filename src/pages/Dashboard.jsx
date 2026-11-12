import { useCallback, useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { Link } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  FaPlus,
  FaPaperPlane,
  FaArrowDown,
  FaMobileAlt,
  FaStore,
  FaBriefcase,
} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

const QUICK_ACTIONS = [
  { label: "Add Money", to: "/fund-wallet", icon: FaPlus },
  { label: "Transfer Money", to: "/send-money", icon: FaPaperPlane },
  { label: "Withdraw", to: "/withdraw", icon: FaArrowDown },
  { label: "Bill Payments", to: "/bills", icon: FaMobileAlt },
  { label: "Pay a Business", to: "/pay", icon: FaStore },
  { label: "My Business", to: "/business", icon: FaBriefcase },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [wallets, setWallets] = useState([]);

  const fetchAll = useCallback(async () => {
    try {
      const stamp = Date.now();
      const [summaryRes, walletsRes] = await Promise.all([
        axiosClient.get("dashboard/summary/", { params: { t: stamp } }),
        axiosClient.get("wallets/", { params: { t: stamp } }),
      ]);
      setData(summaryRes.data);
      setWallets(Array.isArray(walletsRes.data) ? walletsRes.data : []);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const onRefresh = () => fetchAll();
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchAll();
    };
    window.addEventListener("payhost:balance-changed", onRefresh);
    window.addEventListener("focus", onRefresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("payhost:balance-changed", onRefresh);
      window.removeEventListener("focus", onRefresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchAll]);

  if (!data) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
        Loading dashboard...
      </div>
    );
  }

  const primaryWallet = wallets.find((w) => w.is_default) || wallets.find((w) => w.currency_code === "NGN") || wallets[0];

  const weeklyChart = {
    labels: data.weekly_activity?.map((w) => w.date) || [],
    datasets: [
      {
        label: "Transactions",
        data: data.weekly_activity?.map((w) => w.count) || [],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const monthlyChart = {
    labels: data.monthly_activity?.map((m) => m.month) || [],
    datasets: [
      {
        label: "Activity",
        data: data.monthly_activity?.map((m) => m.count) || [],
        backgroundColor: "#10b981",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f3f4f6" }, beginAtZero: true },
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Overview of your account</p>
          <Link to="/how-to-use" style={styles.helpLink}>
            How to use Payhost
          </Link>
        </div>
      </div>

      {/* Primary NGN balance only */}
      <div style={styles.primaryBalanceSection}>
        {primaryWallet ? (
          <div style={styles.primaryCard}>
            <div style={styles.primaryTop}>
              <p style={styles.primaryLabel}>Available balance</p>
              <Link to="/wallet" style={styles.viewWalletsLink}>
                View all wallets →
              </Link>
            </div>
            <h2 style={styles.primaryBalance}>
              {primaryWallet.symbol}
              {Number(primaryWallet.balance).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
            <p style={styles.primaryCurrency}>
              {primaryWallet.currency_code} · {primaryWallet.currency_name}
            </p>
          </div>
        ) : (
          <div style={styles.emptyWallet}>
            <p>No wallet found</p>
            <Link to="/wallet" style={{ color: "#2563eb", fontWeight: 600 }}>
              Go to Wallet
            </Link>
          </div>
        )}
      </div>

      {/* Quick Links – round icons */}
      <div style={styles.quickLinksSection}>
        <h3 style={styles.quickLinksTitle}>Quick Links</h3>
        <div style={styles.quickLinksGrid}>
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.to} to={action.to} style={styles.quickLinkItem}>
                <div style={styles.iconCircle}>
                  <Icon size={22} color="#ffffff" />
                </div>
                <span style={styles.quickLinkLabel}>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Sent</p>
          <h3 style={styles.statValue}>
            ₦{Number(data.total_sent || 0).toLocaleString()}
          </h3>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Funded</p>
          <h3 style={styles.statValue}>
            ₦{Number(data.total_funded || 0).toLocaleString()}
          </h3>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Withdrawn</p>
          <h3 style={styles.statValue}>
            ₦{Number(data.total_withdrawn || 0).toLocaleString()}
          </h3>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Transactions</p>
          <h3 style={styles.statValue}>{data.total_transactions || 0}</h3>
        </div>
      </div>

      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Transactions (Last 7 Days)</h3>
          <Line data={weeklyChart} options={chartOptions} />
        </div>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Monthly Activity</h3>
          <Bar data={monthlyChart} options={chartOptions} />
        </div>
      </div>

      <div style={styles.chartCard}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={styles.chartTitle}>Recent Transactions</h3>
          <Link to="/transactions" style={{ fontSize: 13, color: "#2563eb" }}>
            View all
          </Link>
        </div>

        {data.recent_transactions?.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center", padding: 20 }}>
            No recent transactions
          </p>
        ) : (
          data.recent_transactions?.map((tx, index) => (
            <div key={index} style={styles.txItem}>
              <div>
                <p style={styles.txType}>{tx.type}</p>
                <p style={styles.txDate}>{tx.created_at}</p>
              </div>
              <p
                style={{
                  ...styles.txAmount,
                  color:
                    tx.type?.toLowerCase().includes("receive") ||
                    tx.type === "funding"
                      ? "#16a34a"
                      : "#111827",
                }}
              >
                {tx.type?.toLowerCase().includes("receive") ||
                tx.type === "funding"
                  ? "+"
                  : "-"}
                ₦{Number(tx.amount).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "32px 28px",
    maxWidth: 1100,
    margin: "0 auto",
  },
  header: {
    marginBottom: 24,
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
  helpLink: {
    display: "inline-block",
    marginTop: 4,
    padding: "8px 12px",
    border: "1px solid #bfdbfe",
    borderRadius: 8,
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
  },
  primaryBalanceSection: {
    marginBottom: 28,
  },
  primaryCard: {
    background: "linear-gradient(135deg, #1e40af, #3b82f6)",
    color: "white",
    borderRadius: 16,
    padding: "28px 24px",
    boxShadow: "0 8px 24px rgba(30, 64, 175, 0.2)",
  },
  primaryTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  primaryLabel: {
    margin: 0,
    fontSize: 14,
    fontWeight: 500,
    opacity: 0.9,
  },
  viewWalletsLink: {
    color: "white",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    opacity: 0.9,
  },
  primaryBalance: {
    margin: "4px 0 6px",
    fontSize: 36,
    fontWeight: 700,
  },
  primaryCurrency: {
    margin: 0,
    fontSize: 14,
    opacity: 0.85,
  },
  emptyWallet: {
    textAlign: "center",
    padding: 40,
    background: "white",
    borderRadius: 16,
    border: "1px solid #f3f4f6",
  },
  quickLinksSection: {
    marginBottom: 28,
  },
  quickLinksTitle: {
    margin: "0 0 16px 0",
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
  },
  quickLinksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px 12px",
  },
  quickLinkItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textDecoration: "none",
    color: "#111827",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1e40af, #3b82f6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    boxShadow: "0 4px 12px rgba(30, 64, 175, 0.25)",
  },
  quickLinkLabel: {
    fontSize: 13,
    fontWeight: 600,
    textAlign: "center",
    lineHeight: 1.3,
    color: "#1f2937",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    background: "white",
    padding: "18px",
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
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },
  chartsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 20,
  },
  chartCard: {
    background: "white",
    padding: "20px",
    borderRadius: 16,
    border: "1px solid #f3f4f6",
  },
  chartTitle: {
    margin: "0 0 16px 0",
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
  },
  txItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  txType: {
    margin: 0,
    fontWeight: 600,
    fontSize: 14,
    textTransform: "capitalize",
  },
  txDate: {
    margin: "3px 0 0",
    fontSize: 12,
    color: "#9ca3af",
  },
  txAmount: {
    fontWeight: 600,
    fontSize: 15,
  },
};