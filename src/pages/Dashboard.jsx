import { useEffect, useState } from "react";
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

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [summaryRes, walletsRes] = await Promise.all([
          axiosClient.get("/dashboard/summary/"),
          axiosClient.get("/wallets/"),
        ]);
        setData(summaryRes.data);
        setWallets(walletsRes.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAll();
  }, []);

  if (!data) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
        Loading dashboard...
      </div>
    );
  }

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

  const getWalletGradient = (code) => {
    const gradients = {
      NGN: "linear-gradient(135deg, #1e40af, #3b82f6)",
      USD: "linear-gradient(135deg, #065f46, #10b981)",
      GBP: "linear-gradient(135deg, #7c2d12, #ea580c)",
      EUR: "linear-gradient(135deg, #4c1d95, #8b5cf6)",
    };
    return gradients[code] || "linear-gradient(135deg, #374151, #6b7280)";
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Overview of your account</p>
        </div>
      </div>

      {/* Multi-Currency Balances */}
      <div style={styles.walletsRow}>
        {wallets.length === 0 ? (
          <div style={styles.emptyWallet}>
            <p>No wallets found</p>
            <Link to="/wallet" style={{ color: "#2563eb" }}>
              Go to Wallet
            </Link>
          </div>
        ) : (
          wallets.map((wallet) => (
            <div
              key={wallet.id}
              style={{
                ...styles.walletCard,
                background: getWalletGradient(wallet.currency_code),
              }}
            >
              <div style={styles.walletTop}>
                <span style={styles.currencyCode}>{wallet.currency_code}</span>
                {wallet.is_default && (
                  <span style={styles.defaultBadge}>Default</span>
                )}
              </div>
              <p style={styles.currencyName}>{wallet.currency_name}</p>
              <h2 style={styles.balance}>
                {wallet.symbol}
                {Number(wallet.balance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </h2>
            </div>
          ))
        )}
      </div>

      {/* Quick Stats */}
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

      {/* Charts */}
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

      {/* Recent Transactions */}
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

// ================= STYLES =================
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
  walletsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  walletCard: {
    color: "white",
    borderRadius: 16,
    padding: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
  },
  walletTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 13,
    fontWeight: 600,
    opacity: 0.9,
  },
  defaultBadge: {
    fontSize: 10,
    background: "rgba(255,255,255,0.25)",
    padding: "2px 8px",
    borderRadius: 10,
  },
  currencyName: {
    margin: "0 0 10px 0",
    fontSize: 12,
    opacity: 0.85,
  },
  balance: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
  },
  emptyWallet: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: 30,
    background: "white",
    borderRadius: 12,
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