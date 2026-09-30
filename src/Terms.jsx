import { Link } from "react-router-dom";

export default function Terms() {
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
      <p><Link to="/">← Payhost</Link></p>

      <h1>Terms of use</h1>
      <p>
        By using Payhost you agree to these terms. The service is provided by
        PAYHOST TECHNOLOGIES LTD.
      </p>

      <h2>Accounts</h2>
      <p>
        You must provide accurate details. Do not share login credentials.
        High-value and merchant payments may require PIN or 2FA.
      </p>

      <h2>Payments</h2>
      <p>
        Wallet funding and card charges are processed by Paystack.
        Wallet-to-merchant payments debit your Payhost wallet and credit the
        shop ledger. Settlements to bank accounts require Paystack Transfers on
        a Registered business and are not guaranteed on Starter.
      </p>

      <h2>Shops</h2>
      <p>
        Paying a business is not paying yourself. Shop owners cannot collect
        from their own consumer wallet on the pay path. Disputes: keep the
        payment reference and contact hello@payhost.dev. Chargebacks follow
        Paystack’s process.
      </p>

      <h2>Prohibited use</h2>
      <p>
        Fraud, sanctioned activity, and abuse of test systems in live mode are
        forbidden. We may freeze wallets for suspected abuse.
      </p>

      {/* INSERTED BLOCK */}
      <h2>Disputes</h2>
      <p>
        If a payment looks wrong, email hello@payhost.dev within 48 hours with
        the payment reference, amount, and date. Card chargebacks follow
        Paystack’s process. We will use that reference to check the ledger and
        the Paystack event.
      </p>

      <h2>Contact</h2>
      <p>hello@payhost.dev</p>
    </div>
  );
}
