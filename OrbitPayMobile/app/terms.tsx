import { ScrollView, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function TermsScreen() {
  return (
    <ScrollView style={styles.box} contentContainerStyle={{ paddingBottom: 40 }}>
      <Link href="/" style={styles.back}>
        ← Payhost
      </Link>
      <Text style={styles.h1}>Terms of use</Text>
      <Text style={styles.p}>
        By using Payhost you agree to these terms. The service is provided by
        PAYHOST TECHNOLOGIES LTD.
      </Text>
      <Text style={styles.h2}>Accounts</Text>
      <Text style={styles.p}>
        You must provide accurate details. Do not share login credentials.
        High-value and merchant payments may require PIN or 2FA.
      </Text>
      <Text style={styles.h2}>Payments</Text>
      <Text style={styles.p}>
        Wallet funding and card charges are processed by Paystack.
        Wallet-to-merchant payments debit your Payhost wallet and credit the
        shop ledger. Settlements to bank accounts require Paystack Transfers on
        a Registered business and are not guaranteed on Starter.
      </Text>
      <Text style={styles.h2}>Shops</Text>
      <Text style={styles.p}>
        Paying a business is not paying yourself. Shop owners cannot collect
        from their own consumer wallet on the pay path. Disputes: keep the
        payment reference and contact hello@payhost.dev. Chargebacks follow
        Paystack’s process.
      </Text>
      <Text style={styles.h2}>Prohibited use</Text>
      <Text style={styles.p}>
        Fraud, sanctioned activity, and abuse of test systems in live mode are
        forbidden. We may freeze wallets for suspected abuse.
      </Text>
      <Text style={styles.p}>hello@payhost.dev</Text>
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