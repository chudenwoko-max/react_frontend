import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={wrap}>
      <header style={header}>
        <a href="/" style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/payhost-logo.png"
            alt="Payhost"
            height={36}
            style={{ display: "block" }}
          />
        </a>

        <nav style={nav}>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <a href="https://dashboard.payhost.dev">Sign in</a>
        </nav>
      </header>

      <main style={main}>
        <p style={kicker}>PAYHOST TECHNOLOGIES LTD</p>
        <h1 style={h1}>Payments for wallets and businesses</h1>
        <p style={lead}>
          Payhost lets people fund a wallet, send money, and pay approved
          businesses. Card collections are processed by Paystack.
        </p>
        <p>
          <a href="https://dashboard.payhost.dev" style={btn}>
            Open dashboard
          </a>
        </p>
        <ul style={list}>
          <li>Consumer wallet and merchant collect</li>
          <li>Paystack Checkout — we do not store full card numbers</li>
          <li>Nigeria-based limited company (CAC registration in progress)</li>
        </ul>
      </main>

      <footer style={foot}>
        <div>PAYHOST TECHNOLOGIES LTD</div>
        <div>
          Contact: <a href="mailto:hello@payhost.dev">hello@payhost.dev</a>
        </div>
        <div>Payments processed by Paystack</div>
        <div>
          <Link to="/privacy">Privacy policy</Link>
          {" · "}
          <Link to="/terms">Terms of use</Link>
        </div>
      </footer>
    </div>
  );
}

const wrap = { fontFamily: "system-ui, sans-serif", color: "#0F172A", minHeight: "100vh" };
const header = {
  display: "flex",
  justifyContent: "space-between",
  padding: "20px 28px",
  borderBottom: "1px solid #E2E8F0",
};
const nav = { display: "flex", gap: 16 };
const main = { maxWidth: 720, padding: "48px 28px" };
const kicker = { color: "#64748B", letterSpacing: "0.04em", fontSize: 13 };
const h1 = { fontSize: 36, lineHeight: 1.2, margin: "8px 0 16px" };
const lead = { fontSize: 18, color: "#334155", lineHeight: 1.5 };
const btn = {
  display: "inline-block",
  marginTop: 8,
  background: "#0F172A",
  color: "#fff",
  padding: "12px 18px",
  borderRadius: 10,
  textDecoration: "none",
};
const list = { color: "#475569", lineHeight: 1.8 };
const foot = {
  padding: "28px",
  borderTop: "1px solid #E2E8F0",
  color: "#64748B",
  fontSize: 14,
  lineHeight: 1.8,
};
