export default function Contact() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px", fontFamily: "serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a" }}>Contact Us</h1>
      <p style={{ color: "#475569", lineHeight: 1.6, marginTop: 16 }}>
        We’d love to hear from you.
      </p>
      <p style={{ color: "#475569", lineHeight: 1.6 }}>
        Email: <a href="mailto:hello@payhost.dev" style={{ color: "#2563eb" }}>hello@payhost.dev</a>
      </p>
      <p style={{ color: "#475569", lineHeight: 1.6 }}>
        For account or payment issues, include your username and the transaction reference if you have one.
      </p>
    </div>
  );
}