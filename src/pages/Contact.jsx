export default function Contact() {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "serif",
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#0f172a",
        }}
      >
        Contact Us
      </h1>

      <p
        style={{
          color: "#475569",
          lineHeight: 1.6,
          marginTop: 16,
        }}
      >
        We'd love to hear from you. If you have questions about your account,
        transactions, merchants, privacy, or our services, please contact us.
      </p>

      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#0f172a",
          marginTop: 24,
        }}
      >
        Customer Support
      </h2>

      <p
        style={{
          color: "#475569",
          lineHeight: 1.6,
        }}
      >
        Email:{" "}
        <a
          href="mailto:hello@payhost.dev"
          style={{ color: "#2563eb" }}
        >
          hello@payhost.dev
        </a>
      </p>

      <p
        style={{
          color: "#475569",
          lineHeight: 1.6,
        }}
      >
        Website:{" "}
        <a
          href="https://payhost.dev"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#2563eb" }}
        >
          https://payhost.dev
        </a>
      </p>

      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#0f172a",
          marginTop: 24,
        }}
      >
        Registered Office
      </h2>

      <p
        style={{
          color: "#475569",
          lineHeight: 1.6,
        }}
      >
        PrimeHost Technologies Ltd
        <br />
        13 Tom Makwe Street
        <br />
        Asaba, Delta State
        <br />
        Nigeria
      </p>

      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#0f172a",
          marginTop: 24,
        }}
      >
        Transaction Support
      </h2>

      <p
        style={{
          color: "#475569",
          lineHeight: 1.6,
        }}
      >
        For account or transaction issues, please include:
      </p>

      <ul
        style={{
          color: "#475569",
          lineHeight: 1.8,
        }}
      >
        <li>Your username or registered email address</li>
        <li>Transaction reference</li>
        <li>Transaction amount</li>
        <li>Date and time of the transaction</li>
      </ul>

      <p
        style={{
          marginTop: 32,
          color: "#475569",
        }}
      >
        <strong>PrimeHost Technologies Ltd</strong>
        <br />
        RC: 10000825
      </p>
    </div>
  );
}