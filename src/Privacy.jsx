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
        <img src="/payhost-logo.png" alt="PayHost" height={56} />
      </a>

      <h1>Privacy Policy</h1>

      <p>
        This Privacy Policy explains how PayHost collects, uses, stores, and
        protects your information when you use our website, mobile applications,
        and related services.
      </p>

      <p>
        PayHost is operated by <strong>PrimeHost Technologies Ltd</strong>
        ("PrimeHost", "we", "us", or "our").
      </p>

      <h2>Information We Collect</h2>

      <p>
        We may collect information that you provide directly to us, including:
      </p>

      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>Date of birth</li>
        <li>Identity verification information</li>
        <li>Government-issued identification documents</li>
        <li>Payment and transaction information</li>
      </ul>

      <p>
        We may also collect technical information including:
      </p>

      <ul>
        <li>Device information</li>
        <li>IP address</li>
        <li>Session and authentication information</li>
        <li>Application logs and security events</li>
        <li>Browser and operating system details</li>
      </ul>

      <h2>How We Use Information</h2>

      <p>
        We use collected information to:
      </p>

      <ul>
        <li>Provide and maintain our services</li>
        <li>Process transactions and wallet activities</li>
        <li>Verify user identity and comply with KYC requirements</li>
        <li>Detect, prevent, and investigate fraud</li>
        <li>Respond to customer support requests</li>
        <li>Send service-related communications</li>
        <li>Improve platform performance, reliability, and security</li>
        <li>Comply with legal and regulatory obligations</li>
      </ul>

      <h2>Payment Processing</h2>

      <p>
        Payments may be processed through licensed third-party payment service
        providers and financial institutions integrated into our platform.
        Payment card information is processed by those providers and is not
        stored directly by PayHost.
      </p>

      <h2>Information Sharing</h2>

      <p>
        We do not sell personal information. We may share information with:
      </p>

      <ul>
        <li>Licensed payment service providers</li>
        <li>Financial institutions</li>
        <li>Identity verification providers</li>
        <li>Email and communication service providers</li>
        <li>Cloud hosting and infrastructure providers</li>
        <li>Regulatory authorities when legally required</li>
      </ul>

      <h2>Data Storage & Security</h2>

      <p>
        We implement appropriate technical and organizational safeguards to
        protect personal information against unauthorized access, disclosure,
        alteration, or destruction.
      </p>

      <p>
        While we take reasonable measures to secure information, no method of
        transmission or storage can be guaranteed to be completely secure.
      </p>

      <h2>Data Retention</h2>

      <p>
        We retain information only for as long as necessary to provide our
        services, comply with legal obligations, resolve disputes, prevent
        fraud, and enforce our agreements.
      </p>

      <h2>Your Rights</h2>

      <p>
        Subject to applicable law, including the Nigeria Data Protection Act
        (NDPA), you may request:
      </p>

      <ul>
        <li>Access to your personal information</li>
        <li>Correction of inaccurate information</li>
        <li>Deletion of information where legally permitted</li>
        <li>Withdrawal of consent where applicable</li>
      </ul>

      <h2>International Processing</h2>

      <p>
        Some service providers used to operate PayHost may process information
        outside Nigeria. Where such processing occurs, reasonable safeguards are
        implemented to protect personal information.
      </p>

      <h2>Changes To This Policy</h2>

      <p>
        We may update this Privacy Policy from time to time. Updated versions
        will be published on this page together with the effective date.
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