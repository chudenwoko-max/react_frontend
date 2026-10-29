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
        <p>
          <strong>Why KYC matters</strong><br />
          Know Your Customer (KYC) is required by Nigerian financial regulations.
          When you verify your identity you:
        </p>
        <ul>
          <li>Help Payhost stay compliant with the law</li>
          <li>Protect your account from fraud</li>
          <li>Unlock higher transaction limits (higher tiers let you send, withdraw, and pay larger amounts)</li>
          <li>Make your account ready for the real launch</li>
        </ul>
        <p>Complete KYC early so your limits are ready when real money is enabled.</p>
      </section>

      <section style={styles.section}>
        <h2>Dashboard</h2>
        <p>See your balances in NGN, GBP, EUR and other wallets. Tap a wallet to view more details. Use the menu to reach any feature.</p>
      </section>

      <section style={styles.section}>
        <h2>Wallet</h2>
        <p>View all your wallets, balances, and set a default wallet. This is where your money lives inside Payhost.</p>
      </section>

      <section style={styles.section}>
        <h2>Send Money</h2>
        <ol>
          <li>Choose wallet-to-wallet (Payhost user) or bank transfer.</li>
          <li>Enter the recipient (username, phone, or bank details).</li>
          <li>Enter amount and description.</li>
          <li>Confirm with your PIN.</li>
          <li>Money leaves your wallet immediately if the checks pass.</li>
        </ol>
      </section>

      <section style={styles.section}>
        <h2>Request Money</h2>
        <p>Ask another Payhost user to send you money. They receive a notification and can approve or decline.</p>
      </section>

      <section style={styles.section}>
        <h2>Fund Wallet</h2>
        <p>Add money using card, bank transfer, or other methods shown. The money appears in your NGN wallet after successful payment.</p>
      </section>

      <section style={styles.section}>
        <h2>Withdraw</h2>
        <p>Move money from your Payhost wallet to your linked bank account. Enter amount → confirm with PIN → funds are sent.</p>
      </section>

      <section style={styles.section}>
        <h2>Transactions</h2>
        <p>Full history of money in and out. Filter by date or type. Tap any item for details or receipt.</p>
      </section>

      <section style={styles.section}>
        <h2>Currency Converter</h2>
        <p>See exchange rates and convert between your wallets (where available). Conversion happens inside Payhost.</p>
      </section>

      <section style={styles.section}>
        <h2>Verify Identity (KYC)</h2>
        <p>Verify your identity to raise your account tier and stay compliant.</p>
        <ol>
          <li>Go to <strong>Verify Identity</strong>.</li>
          <li>Upload a valid government ID and a clear selfie.</li>
          <li>Submit and wait for review (usually quick in testing).</li>
        </ol>
        <p><strong>Benefits of completing KYC</strong></p>
        <ul>
          <li>Higher daily and monthly transfer limits</li>
          <li>Ability to withdraw larger amounts</li>
          <li>Reduced holds on new devices or new beneficiaries</li>
          <li>Full compliance with regulatory requirements</li>
          <li>Smoother experience when the app goes live with real money</li>
        </ul>
        <p>Without KYC your account stays on the lowest tier and many actions remain limited.</p>
      </section>

      <section style={styles.section}>
        <h2>Profile</h2>
        <p>Update your personal details and manage security from this page.</p>
        <p><strong>Personal details</strong></p>
        <ul>
          <li>Change your name, phone number, or email.</li>
          <li>Email changes require your current transfer PIN.</li>
          <li>Save after editing.</li>
        </ul>
        <p><strong>Security controls</strong></p>
        <p><strong>Transfer PIN</strong><br />
          Your transfer PIN is created the first time you send money, withdraw, or pay a bill.
          You will be asked to set it at that moment. You can change it later from Profile.
          After too many wrong attempts the PIN locks for 10 minutes.
        </p>
        <p><strong>Two-Factor Authentication (2FA)</strong><br />
          Turn on 2FA for extra login protection. Scan the QR code with an authenticator app or enter the secret key, then confirm with the 6-digit code. You will need the code each time you log in from a new device.
        </p>
        <p><strong>Lock Wallet</strong><br />
          Instantly freeze your wallet if you suspect unauthorised access. While locked, no sends, withdrawals, or bill payments can leave the account. Unlock requires both your PIN and a one-time code.
        </p>
        <p>Keep your PIN and 2FA app private. Use Lock Wallet immediately if you notice anything unusual.</p>
      </section>

      <section style={styles.section}>
        <h2>Avatar Upload</h2>
        <p>Change your profile picture. It appears on your dashboard and to people you transact with.</p>
      </section>

      <section style={styles.section}>
        <h2>Bank Account</h2>
        <p>Link your Nigerian bank account. Required before you can withdraw. New accounts may have a short cooldown before large withdrawals.</p>
      </section>

      <section style={styles.section}>
        <h2>Bill Payments</h2>
        <p>Pay airtime, data, electricity, cable, and other bills. Choose the biller → enter details → pay from your wallet.</p>
      </section>

      <section style={styles.section}>
        <h2>Savings Goals</h2>
        <p>Create a savings target, move money into it, and track progress. Money stays in your account but is set aside.</p>
      </section>

      <section style={styles.section}>
        <h2>Virtual Cards</h2>
        <p>Create virtual cards for online payments (where available). Fund the card from your wallet and use the card details.</p>
      </section>

      <section style={styles.section}>
        <h2>Refer & Earn</h2>
        <p>Share your referral code. When friends join and meet the conditions, both of you can earn a reward.</p>
      </section>

      <section style={styles.section}>
        <h2>Scheduled</h2>
        <p>Set transfers or payments to happen automatically on a future date or recurring schedule.</p>
      </section>

      <section style={styles.section}>
        <h2>Help & Support</h2>
        <p>Contact the team, view FAQs, or send feedback. Use this if something doesn’t work as expected.</p>
      </section>

      <section style={styles.section}>
        <h2>Statements</h2>
        <p>Generate and download a statement of account for any period. Useful for records or proof of transactions.</p>
      </section>

      <section style={styles.section}>
        <h2>Tips</h2>
        <ul>
          <li>Always fund your wallet before sending or paying bills.</li>
          <li>Large amounts and new beneficiaries may be held briefly for review.</li>
          <li>Keep your PIN and password private.</li>
          <li>Complete KYC to raise your limits before the real launch.</li>
        </ul>
      </section>

      <p style={{ marginTop: 32 }}>
        <Link to="/dashboard">← Back to Dashboard</Link>
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