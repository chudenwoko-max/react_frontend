import { Link } from "react-router-dom";

export default function HowToUse() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>How to use Payhost</h1>
      <p style={styles.lead}>
        Everything you need to explore Payhost safely during the testing stage.
      </p>

      <section style={styles.section}>
        <h2 style={styles.h2}>Introduction</h2>
        <p>
          Payhost is currently in <strong>testing stage only</strong>.
        </p>
        <p>
          Do <strong>not</strong> use real money, real bank details, or real personal information while testing.
          The main public launch will be announced when the app is ready for real use.
        </p>
        <p>
          During this period you can explore every feature safely. All money movement is simulated or runs through test payment partners.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Why KYC matters</h2>
        <p>
          Know Your Customer (KYC) is required by Nigerian financial regulations. Completing it early protects your account and prepares you for the real launch.
        </p>
        <ul>
          <li>Helps Payhost stay compliant with the law</li>
          <li>Protects your account from fraud</li>
          <li>Unlocks higher transaction limits</li>
          <li>Reduces holds on new devices or new beneficiaries</li>
          <li>Makes your account ready for when real money is enabled</li>
        </ul>
        <p>
          Without KYC your account stays on the lowest tier. Complete it from <strong>Get Verified</strong> as soon as possible.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Sign in</h2>
        <p>Payhost uses a 6-digit passcode (similar to many Nigerian banking apps).</p>
        <ul>
          <li>Enter your <strong>username</strong> and <strong>6-digit passcode</strong>.</li>
          <li>After your first successful login the username stays filled in on that device.</li>
          <li>If two-factor authentication is enabled, you will be asked for a 6-digit code from your authenticator app.</li>
          <li>Tap <strong>Forgot passcode?</strong> if you forget it.</li>
          <li>New users can tap <strong>Create Account</strong>.</li>
          <li>Use <strong>Use a different account</strong> to clear the saved username.</li>
        </ul>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Dashboard</h2>
        <p>
          Your primary NGN balance is shown at the top. Below it, round Quick Link icons let you:
        </p>
        <ul>
          <li>Add Money</li>
          <li>Transfer Money</li>
          <li>Withdraw</li>
          <li>Bill Payments</li>
          <li>Pay a Business</li>
          <li>My Business</li>
        </ul>
        <p>Recent transactions and charts appear further down. Tap <strong>View all wallets</strong> to see other currencies.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Pay a Business</h2>
        <p>Send money to an approved merchant.</p>
        <ol>
          <li>Open <strong>Pay a Business</strong> from the dashboard or sidebar.</li>
          <li>Search for the business by name (or enter the Merchant ID).</li>
          <li>Enter the amount and optional description.</li>
          <li>Pay from your wallet (requires transfer PIN) or with a card via Paystack.</li>
        </ol>
        <p>Successful payments appear in your transaction history. The merchant receives the credit in their business balance.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>My Business</h2>
        <p>Collect payments if you are (or want to become) a merchant.</p>
        <ul>
          <li><strong>Not started</strong> – fill the short application (business name + phone) and submit.</li>
          <li><strong>Pending</strong> – wait for admin review.</li>
          <li><strong>Approved</strong> – see your available balance, recent charges, create payment links, and request payouts.</li>
          <li><strong>Rejected / Suspended</strong> – view the reason and re-apply if allowed.</li>
        </ul>
        <p>Open it from the dashboard Quick Links or the sidebar. Status controls what you can do.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Wallet</h2>
        <p>View all your wallets and balances. Convert between currencies (where available) and set a default wallet. This is where your money lives inside Payhost.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Send Money</h2>
        <ol>
          <li>Choose wallet-to-wallet (Payhost user) or bank transfer.</li>
          <li>Enter the recipient (username, phone, or bank details).</li>
          <li>Enter amount and description.</li>
          <li>Confirm with your <strong>4-digit transfer PIN</strong>.</li>
          <li>Money leaves your wallet immediately if the checks pass.</li>
        </ol>
        <p>If you have not set a transfer PIN yet, you will be asked to create one the first time you send money.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Request Money</h2>
        <p>Ask another Payhost user to send you money. They receive a notification and can approve or decline. When they pay, both balances and transaction histories update.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Add Money</h2>
        <p>Add money using card or other methods shown. After Paystack success you return to the dashboard and the amount appears in your NGN wallet.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Withdraw</h2>
        <p>Move money from your Payhost wallet to your linked bank account. Enter amount → confirm with your 4-digit transfer PIN → funds are sent.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Transactions</h2>
        <p>Full history of money in and out, including transfers, bill payments, merchant payments, card funding, and savings. Filter by date or type. Tap any item for details or receipt.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Get Verified (KYC)</h2>
        <p>Get verified to raise your account tier and stay compliant.</p>
        <ol>
          <li>Go to <strong>Get Verified</strong>.</li>
          <li>Fill in the required personal details.</li>
          <li>Upload a valid government ID, proof of address, and a clear selfie.</li>
          <li>Submit and wait for review.</li>
        </ol>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Security</h2>
        <p><strong>Two-Factor Authentication (2FA)</strong><br />
          When enabled, login requires both your passcode and a 6-digit code from an authenticator app.
        </p>
        <p><strong>Transfer PIN</strong><br />
          Your 4-digit PIN is required for sending money, withdrawing, paying businesses from wallet, and other sensitive actions.
        </p>
        <p><strong>Lock Wallet</strong><br />
          Freezes the wallet and signs out all sessions. Unlock requires your transfer PIN plus an email code.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Profile</h2>
        <p>Update your personal details (name, phone, email). Email changes may require your transfer PIN. Avatar and other preferences are managed here.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Bank Account</h2>
        <p>Link your Nigerian bank account. Required before you can withdraw. New accounts may have a short cooldown before large withdrawals.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Bill Payments</h2>
        <p>Pay airtime, data, electricity, and cable TV from your wallet. Confirm with your transfer PIN where required. You stay on the dashboard after a successful purchase.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Savings Goals</h2>
        <p>Create a savings target, move money into it from your wallet, and track progress.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Virtual Cards</h2>
        <p>Create virtual cards for online payments (where available). Fund the card from your wallet using your transfer PIN.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Referral</h2>
        <p>Share your referral code or invite link. Track who signed up through you.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Scheduled</h2>
        <p>Set transfers or payments to happen automatically on a future date or recurring schedule.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Statements</h2>
        <p>Generate and download a statement of account for any period.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Help & Support</h2>
        <p>Contact the team, view FAQs, or send feedback during testing.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Tips for safe use</h2>
        <ul>
          <li>Complete KYC early.</li>
          <li>Enable two-factor authentication.</li>
          <li>Keep your passcode and transfer PIN private.</li>
          <li>Lock the wallet immediately if you see a login you do not recognise.</li>
          <li>Fund your wallet before sending or paying bills.</li>
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
    background: "linear-gradient(135deg, #1e40af, #3b82f6)",
    color: "#ffffff",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
    boxShadow: "0 4px 12px rgba(30, 64, 175, 0.25)",
  },
};