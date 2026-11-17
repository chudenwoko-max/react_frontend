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
      <a
        href="/"
        style={{ display: "inline-flex", alignItems: "center", marginBottom: 24 }}
      >
        <img src="/payhost-logo.png" alt="PayHost" height={56} />
      </a>

      <h1>Terms of Use</h1>

      <p>
        These Terms of Use govern your access to and use of PayHost. By creating
        an account or using any PayHost service, you agree to be bound by these
        Terms.
      </p>

      <p>
        PayHost is operated by <strong>PrimeHost Technologies Ltd</strong>,
        a company incorporated in Nigeria.
      </p>

      <h2>Eligibility</h2>
      <p>
        You must provide accurate and complete information during registration.
        You are responsible for maintaining the confidentiality of your account,
        passcode, PIN, and authentication credentials.
      </p>

      <h2>Account Security</h2>
      <p>
        You are responsible for all activities carried out through your account.
        You must notify us immediately if you suspect unauthorized access,
        compromise of credentials, or suspicious account activity.
      </p>

      <h2>Wallet Funding & Payments</h2>
      <p>
        Certain payment and wallet funding services are provided through licensed
        third-party payment providers and financial institutions. Card charges,
        transfers, and related payment processing may be facilitated through
        integrated payment partners.
      </p>

      <p>
        We reserve the right to delay, reject, reverse, or investigate any
        transaction where fraud, error, regulatory requirements, or security
        concerns are suspected.
      </p>

      <h2>Merchant Payments</h2>
      <p>
        Users may make payments to registered merchants and businesses through
        the platform. All transactions are recorded in our internal ledger and
        are subject to verification, fraud monitoring, and compliance checks.
      </p>

      <h2>Chargebacks & Disputes</h2>
      <p>
        Chargebacks initiated through card schemes or payment providers will be
        handled in accordance with the applicable provider's policies. We may
        temporarily restrict access to funds while disputes are under review.
      </p>

      <h2>Prohibited Activities</h2>
      <p>
        You may not use PayHost for unlawful activities, fraud, money
        laundering, sanctions evasion, unauthorized access, abuse of platform
        features, or any activity that violates applicable laws and regulations.
      </p>

      <h2>Suspension & Termination</h2>
      <p>
        We may suspend, restrict, or terminate access to your account where we
        reasonably believe there has been a breach of these Terms, fraudulent
        conduct, security concerns, or legal or regulatory requirements.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, PrimeHost Technologies Ltd shall
        not be liable for indirect, incidental, consequential, or special losses
        arising from the use of the platform, including service interruptions,
        delays, third-party failures, or unauthorized access resulting from a
        user's failure to safeguard credentials.
      </p>

      <h2>Privacy</h2>
      <p>
        Your use of PayHost is also governed by our Privacy Policy, which
        explains how personal information is collected, processed, stored, and
        protected.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the
        platform after updates become effective constitutes acceptance of the
        revised Terms.
      </p>

      <h2>Contact Us</h2>
      <p>
        Email: hello@payhost.dev
        <br />
        Website: https://payhost.dev
      </p>

      <p style={{ marginTop: 32 }}>
        <strong>PrimeHost Technologies Ltd</strong>
        <br />
        RC: 10000825
      </p>
    </div>
  );
}