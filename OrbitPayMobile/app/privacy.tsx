import { ScrollView, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.box} contentContainerStyle={{ paddingBottom: 40 }}>
      <Link href="/" style={styles.back}>
        ← Payhost
      </Link>
      <Text style={styles.h1}>Privacy policy</Text>
      <Text style={styles.p}>
        PAYHOST TECHNOLOGIES LTD (“Payhost”, “we”) operates payhost.dev and the
        Payhost apps.
      </Text>
      <Text style={styles.h2}>What we collect</Text>
      <Text style={styles.p}>
        Account data (name, email, phone), KYC documents you submit, wallet and
        ledger records, device/session data, and payment metadata. Card numbers
        are collected by Paystack, not stored by us. We keep Paystack
        authorization tokens only when you save a card.
      </Text>
      <Text style={styles.h2}>Why</Text>
      <Text style={styles.p}>
        To provide the wallet and merchant-pay service, prevent fraud, meet
        KYC/AML expectations, send transactional email, and improve reliability.
      </Text>
      <Text style={styles.h2}>Processors</Text>
      <Text style={styles.p}>
        Paystack (payments), Resend (email), Render/Neon/Cloudflare/Vercel
        (hosting). Data may be processed outside Nigeria by those providers.
      </Text>
      <Text style={styles.h2}>Your rights (NDPA)</Text>
      <Text style={styles.p}>
        You may request access, correction, or deletion of personal data we
        hold, subject to legal retention for transactions. Contact
        hello@payhost.dev.
      </Text>
      <Text style={styles.p}>PAYHOST TECHNOLOGIES LTD · hello@payhost.dev</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, backgroundColor: "#F8FAFC", padding: 24, paddingTop: 56 },
  back: { color: "#0284C7", marginBottom: 16 },
  h1: { fontSize: 28, fontWeight: "700", color: "#0F172A", marginBottom: 12 },
  h2: { fontSize: 18, fontWeight: "700", color: "#0F172A", marginTop: 20, marginBottom: 8 },
  p: { fontSize: 16, lineHeight: 24, color: "#334155", marginBottom: 8 },
});