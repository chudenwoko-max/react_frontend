import { Link } from "react-router-dom";

export default function HowToUse() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>How to use Payhost</h1>

      <section style={styles.section}>
        <h2>Introduction</h2>
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
        <h2>Why KYC matters</h2>
        <p>
          Know Your Customer (KYC) is required by Nigerian financial regulations. Completing it early protects your account and prepares you for the real launch.
        </p>
        <ul>
          <li>Helps Payhost stay compliant with the law</li>
          <li>Protects your account from fraud</li>
          <li>Unlocks higher transaction limits (higher tiers let you send, withdraw, and pay larger amounts)</li>
          <li>Reduces holds on new devices or new beneficiaries</li>
          <li>Makes your account ready for when real money is enabled</li>
        </ul>
        <p>
          Without KYC your account stays on the lowest tier and many actions remain limited. Complete it from <strong>Verify Identity</strong> as soon as possible.
        </p>
      </section>

      <section style={styles.section}>
        <h2>Sign in</h2>
        <p>Payhost uses a 6-digit passcode (similar to many Nigerian banking apps).</p>
        <ul>
          <li>Enter your <strong>username</strong> and <strong>6-digit passcode</strong>.</li>
          <li>After your first successful login the username stays filled in on that device.</li>
          <li>If two-factor authentication is enabled, you will be asked for a 6-digit code from your authenticator app after the passcode.</li>
          <li>Tap <strong>Forgot passcode?</strong> if you forget it — enter your username and a reset link is sent to your email.</li>
          <li>New users can tap <strong>Create Account</strong> to register.</li>
          <li>Use <strong>Use a different account</strong> to clear the saved username and sign in as someone else.</li>
        </ul>
      </section>

      <section style={styles.section}>
        <h2>Dashboard</h2>
        <p>Your primary NGN balance is shown at the top. Use the quick actions to add money, transfer, pay a merchant, or withdraw. Recent transactions appear below. Tap <strong>View all wallets</strong> to see other currencies.</p>
      </section>

      <section style={styles.section}>
        <h2>Wallet</h2>
        <p>View all your wallets and balances. You can convert between currencies (where available) and set a default wallet. This is where your money lives inside Payhost.</p>
      </section>

      <section style={styles.section}>
        <h2>Send Money</h2>
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
        <h2>Request Money</h2>
        <p>Ask another Payhost user to send you money. They receive a notification and can approve or decline. When they pay, both balances and transaction histories update.</p>
      </section>

      <section style={styles.section}>
        <h2>Add Money</h2>
        <p>Add money using card, bank transfer, or other methods shown. The money appears in your NGN wallet after successful payment.</p>
      </section>

      <section style={styles.section}>
        <h2>Withdraw</h2>
        <p>Move money from your Payhost wallet to your linked bank account. Enter amount → confirm with your 4-digit transfer PIN → funds are sent.</p>
      </section>

      <section style={styles.section}>
        <h2>Transactions</h2>
        <p>Full history of money in and out, including transfers, bill payments, card funding, and savings. Filter by date or type. Tap any item for details or receipt.</p>
      </section>

      <section style={styles.section}>
        <h2>Verify Identity (KYC)</h2>
        <p>Verify your identity to raise your account tier and stay compliant.</p>
        <ol>
          <li>Go to <strong>Verify Identity</strong>.</li>
          <li>Fill in the required personal details (name, date of birth, address, BVN/NIN, etc.).</li>
          <li>Upload a valid government ID, proof of address, and a clear selfie.</li>
          <li>Submit and wait for review.</li>
        </ol>
        <p>Completing KYC raises your limits and reduces certain holds. Do this before the real launch.</p>
      </section>

      <section style={styles.section}>
        <h2>Security</h2>
        <p>Access security settings from the sidebar. These controls protect your account.</p>

        <p><strong>Two-Factor Authentication (2FA)</strong><br />
          Strongly recommended. When enabled, login requires both your passcode and a 6-digit code from an authenticator app (Google Authenticator, Authy, etc.).
        </p>
        <ol>
          <li>Go to <strong>Security</strong>.</li>
          <li>Tap <strong>Enable</strong>.</li>
          <li>Scan the QR code with your authenticator app (or enter the secret manually).</li>
          <li>Enter the 6-digit code shown in the app to confirm.</li>
          <li>2FA is now active. You will need the code on future logins.</li>
        </ol>
        <p>You can disable 2FA later from the same page if needed.</p>

        <p><strong>Transfer PIN</strong><br />
          Your 4-digit transfer PIN is required for sending money, withdrawing, funding cards, and other sensitive actions. Set it the first time you perform one of these actions, or manage it from Profile / Security. After too many wrong attempts the PIN locks temporarily.
        </p>

        <p><strong>Lock Wallet</strong><br />
          Use this immediately if you notice a suspicious login or unauthorised activity.
        </p>
        <ul>
          <li>Go to <strong>Security</strong> → <strong>Lock wallet</strong>.</li>
          <li>Enter your transfer PIN to confirm.</li>
          <li>All sessions are signed out and the wallet is frozen.</li>
          <li>While locked, no sends, withdrawals, or bill payments can leave the account.</li>
          <li>To unlock, you will need both your transfer PIN and a one-time code sent to your email.</li>
        </ul>
        <p>Lock the wallet first, then change your passcode and review recent activity.</p>
      </section>

      <section style={styles.section}>
        <h2>Profile</h2>
        <p>Update your personal details (name, phone, email). Email changes may require your transfer PIN. Avatar and other preferences are also managed here.</p>
      </section>

      <section style={styles.section}>
        <h2>Bank Account</h2>
        <p>Link your Nigerian bank account. Required before you can withdraw. New accounts may have a short cooldown before large withdrawals.</p>
      </section>

      <section style={styles.section}>
        <h2>Bill Payments</h2>
        <p>Pay airtime, data, electricity, and cable TV. Phone numbers must be 11 digits. Meter numbers are 11 digits. Smartcard / IUC numbers are 10 digits. Confirm with your transfer PIN where required.</p>
      </section>

      <section style={styles.section}>
        <h2>Savings Goals</h2>
        <p>Create a savings target, move money into it from your wallet, and track progress. Money stays in your account but is set aside. Funding a goal updates your balance and appears in transactions.</p>
      </section>

      <section style={styles.section}>
        <h2>Virtual Cards</h2>
        <p>Create virtual cards for online payments (where available). Fund the card from your wallet using your transfer PIN. Card details are masked for security. Funding appears in your transaction history.</p>
      </section>

      <section style={styles.section}>
        <h2>Referral</h2>
        <p>Share your referral code or invite link with friends. When they join, you can track who signed up through you.</p>
      </section>

      <section style={styles.section}>
        <h2>Scheduled</h2>
        <p>Set transfers or payments to happen automatically on a future date or recurring schedule.</p>
      </section>

      <section style={styles.section}>
        <h2>Statements</h2>
        <p>Generate and download a statement of account for any period. Useful for records or proof of transactions.</p>
      </section>

      <section style={styles.section}>
        <h2>Help & Support</h2>
        <p>Contact the team, view FAQs, or send feedback. Use this if something doesn’t work as expected during testing.</p>
      </section>

      <section style={styles.section}>
        <h2>Tips for safe use</h2>
        <ul>
          <li>Complete KYC early so your limits are ready for the real launch.</li>
          <li>Enable two-factor authentication from the Security page.</li>
          <li>Keep your 6-digit passcode and 4-digit transfer PIN private. Never share them.</li>
          <li>If you see a login you do not recognise, lock the wallet immediately from Security.</li>
          <li>Always fund your wallet before sending or paying bills.</li>
          <li>Large amounts and new beneficiaries may be held briefly for review.</li>
          <li>New devices trigger an email notification — use the “not me” link if it was not you.</li>
        </ul>
      </section>

      <p style={{ marginTop: 32 }}>
        <Link to="/dashboard" aria-label="Back to Dashboard">
          ← Back to Dashboard
        </Link>
      </p>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "24px 20px 60px",
    lineHeight: 1.6,
    color: "#0F172A",
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    fontWeight: 700,
  },
  section: {
    marginBottom: 32,
  },
};