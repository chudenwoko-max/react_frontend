import { Link } from "react-router-dom";

export default function HowToUse() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>How to use PayHost</h1>
      <p style={styles.lead}>
        A guide to the main features available on PayHost.
      </p>

      <section style={styles.section}>
        <h2 style={styles.h2}>Introduction</h2>
        <p>
          PayHost is a digital platform operated by <strong>PrimeHost Technologies Ltd</strong>.
          It provides software tools for managing transactions, interacting with merchants,
          and accessing related digital services.
        </p>
        <p>
          Certain payment-related features are facilitated through licensed third-party
          payment providers and financial institutions.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Verification (KYC)</h2>
        <p>
          Completing verification helps protect your account and may unlock higher
          transaction limits. It is also required to meet applicable regulatory expectations.
        </p>
        <ul>
          <li>Helps protect your account</li>
          <li>Supports compliance requirements</li>
          <li>May increase your transaction limits</li>
          <li>Reduces holds on new devices or beneficiaries</li>
        </ul>
        <p>
          Complete it from <strong>Get Verified</strong> by providing the requested details
          and documents.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Sign in</h2>
        <p>PayHost uses a 6-digit passcode on a recognised device.</p>
        <ul>
          <li>Enter your <strong>6-digit passcode</strong> in the boxes.</li>
          <li>If two-factor authentication is enabled, enter the code from your authenticator app.</li>
          <li>Use <strong>Forgot passcode?</strong> if you need to reset it.</li>
          <li>New users can create an account from the sign-in page.</li>
        </ul>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Dashboard</h2>
        <p>
          Your primary NGN balance is shown at the top. Quick actions include:
        </p>
        <ul>
          <li>Add Money</li>
          <li>Transfer Money</li>
          <li>Withdraw</li>
          <li>Bill Payments</li>
          <li>Pay a Business</li>
          <li>My Business</li>
        </ul>
        <p>Recent activity appears further down the page.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Pay a Business</h2>
        <p>Send a payment to an approved merchant.</p>
        <ol>
          <li>Open <strong>Pay a Business</strong>.</li>
          <li>Search for the business by name.</li>
          <li>Enter the amount and an optional description.</li>
          <li>Pay from your wallet (requires transfer PIN) or with a card.</li>
        </ol>
        <p>Successful payments appear in your transaction history.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>My Business</h2>
        <p>Collect payments if you are approved as a merchant.</p>
        <ul>
          <li><strong>Not started</strong> – submit a short application.</li>
          <li><strong>Pending</strong> – under review.</li>
          <li><strong>Approved</strong> – view balance, create payment links, and request settlements.</li>
          <li><strong>Rejected / Suspended</strong> – review the reason.</li>
        </ul>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Wallet</h2>
        <p>
          View your balances. Currency conversion (where available) is handled within the platform.
          Payment settlements are typically received in NGN.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Send Money</h2>
        <ol>
          <li>Choose a PayHost user or a bank account.</li>
          <li>Enter the recipient details.</li>
          <li>Enter the amount.</li>
          <li>Confirm with your <strong>4-digit transfer PIN</strong>.</li>
        </ol>
        <p>You will be asked to create a transfer PIN the first time you send money.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Request Money</h2>
        <p>
          Request money from another PayHost user. They can approve or decline.
          Approved requests update both balances.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Add Money</h2>
        <p>
          Add funds to your NGN balance using the methods shown. After a successful
          payment you are returned to the dashboard.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Withdraw</h2>
        <p>
          Move funds from your PayHost balance to a linked bank account.
          Confirm with your transfer PIN.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Transactions</h2>
        <p>
          View the history of money in and out, including transfers, bill payments,
          merchant payments, and funding. Tap any item for details.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Get Verified (KYC)</h2>
        <ol>
          <li>Go to <strong>Get Verified</strong>.</li>
          <li>Provide the required personal details.</li>
          <li>Upload a government ID, proof of address, and a selfie.</li>
          <li>Submit and wait for review.</li>
        </ol>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Security</h2>
        <p><strong>Two-Factor Authentication (2FA)</strong><br />
          When enabled, login requires both your passcode and a code from an authenticator app.
        </p>
        <p><strong>Transfer PIN</strong><br />
          Required for sending money, withdrawing, and other sensitive actions.
        </p>
        <p><strong>Lock Wallet</strong><br />
          Freezes the wallet and signs out sessions. Unlocking requires your transfer PIN and an email code.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Profile</h2>
        <p>Update your personal details. Some changes may require your transfer PIN.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Bank Account</h2>
        <p>Link a Nigerian bank account before withdrawing. New accounts may have a short cooldown.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Bill Payments</h2>
        <p>Pay airtime, data, electricity, and cable from your balance. Confirm with your transfer PIN where required.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Virtual Cards</h2>
        <p>Create virtual cards for online payments (where available). Fund them from your balance using your transfer PIN.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Referral</h2>
        <p>Share your referral code. Track users who signed up through you.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Help & Support</h2>
        <p>Contact the team or open a support ticket if you need assistance.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Tips</h2>
        <ul>
          <li>Complete verification early.</li>
          <li>Enable two-factor authentication.</li>
          <li>Keep your passcode and transfer PIN private.</li>
          <li>Lock the wallet if you notice unrecognized activity.</li>
        </ul>
      </section>

      <div style={styles.footer}>
        <Link to="/dashboard" style={styles.backBtn}>
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "32px 24px 80px",
    lineHeight: 1.65,
    color: "#0F172A",
  },
  title: {
    fontSize: 28,
    margin: "0 0 8px",
    fontWeight: 700,
  },
  lead: {
    color: "#64748b",
    marginTop: 0,
    marginBottom: 28,
    fontSize: 15,
  },
  section: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "20px 22px",
    marginBottom: 16,
  },
  h2: {
    fontSize: 18,
    fontWeight: 650,
    margin: "0 0 12px",
    color: "#1e40af",
  },
  footer: {
    marginTop: 28,
    textAlign: "center",
  },
  backBtn: {
    display: "inline-block",
    padding: "12px 22px",
    background: "#2563eb",
    color: "#ffffff",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
  },
};