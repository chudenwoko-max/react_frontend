import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 720,
        margin: "40px auto",
        padding: 24,
        color: "#0F172A",
      }}
    >

      <a
        href="/"
        style={{ display: "inline-flex", alignItems: "center", marginBottom: 24 }}
      >
        <img src="/payhost-logo.png" alt="Payhost" height={56} />
      </a>

      <p><Link to="/">← Payhost</Link></p>

      <h1>Privacy policy</h1>
      <p>PAYHOST TECHNOLOGIES LTD (“Payhost”, “we”) operates payhost.dev and the Payhost apps.</p>

      <h2>What we collect</h2>
      <p>
        Account data (name, email, phone), KYC documents you submit, wallet and
        ledger records, device/session data, and payment metadata. Card numbers
        are collected by Paystack, not stored by us. We keep Paystack
        authorization tokens only when you save a card.
      </p>

      <h2>Why</h2>
      <p>
        To provide the wallet and merchant-pay service, prevent fraud, meet
        KYC/AML expectations, send transactional email, and improve reliability.
      </p>

      <h2>Processors</h2>
      <p>
        Paystack (payments), Resend (email), Render/Neon/Cloudflare/Vercel
        (hosting). Data may be processed outside Nigeria by those providers.
      </p>

      <h2>Your rights (NDPA)</h2>
      <p>
        You may request access, correction, or deletion of personal data we
        hold, subject to legal retention for transactions. Contact
        hello@payhost.dev.
      </p>

      <h2>Contact</h2>
      <p>PAYHOST TECHNOLOGIES LTD · hello@payhost.dev</p>
    </div>
  );
}
