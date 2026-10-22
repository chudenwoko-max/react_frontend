import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function Legal() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Privacy & Terms" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.brandRow}>
          <Image
            source={require("../../assets/payhost-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brand}>PAYHOST</Text>
        </View>

        <Text style={styles.company}>PAYHOST TECHNOLOGIES LTD</Text>
        <Text style={styles.tagline}>Payments for wallets and businesses</Text>

        <Text style={styles.heading}>Privacy policy</Text>
        <Text style={styles.body}>
          PAYHOST TECHNOLOGIES LTD (“Payhost”, “we”) operates payhost.dev and the Payhost apps.{"\n\n"}
          What we collect{"\n"}
          Account data (name, email, phone), KYC documents you submit, wallet and ledger records, device/session data, and payment metadata. Card numbers are collected by Paystack, not stored by us. We keep Paystack authorization tokens only when you save a card.{"\n\n"}
          Why{"\n"}
          To provide the wallet and merchant-pay service, prevent fraud, meet KYC/AML expectations, send transactional email, and improve reliability.{"\n\n"}
          Processors{"\n"}
          Paystack (payments), Resend (email), Render/Neon/Cloudflare/Vercel (hosting). Data may be processed outside Nigeria by those providers.{"\n\n"}
          Your rights (NDPA){"\n"}
          You may request access, correction, or deletion of personal data we hold, subject to legal retention for transactions. Contact hello@payhost.dev.{"\n\n"}
          Contact{"\n"}
          PAYHOST TECHNOLOGIES LTD · hello@payhost.dev
        </Text>

        <Text style={styles.heading}>Terms of use</Text>
        <Text style={styles.body}>
          By using Payhost you agree to these terms. The service is provided by PAYHOST TECHNOLOGIES LTD.{"\n\n"}
          Accounts{"\n"}
          You must provide accurate details. Do not share login credentials. High-value and merchant payments may require PIN or 2FA.{"\n\n"}
          Payments{"\n"}
          Wallet funding and card charges are processed by Paystack. Wallet-to-merchant payments debit your Payhost wallet and credit the shop ledger. Settlements to bank accounts require Paystack Transfers on a Registered business and are not guaranteed on Starter.{"\n\n"}
          Shops{"\n"}
          Paying a business is not paying yourself. Shop owners cannot collect from their own consumer wallet on the pay path. Disputes: keep the payment reference and contact hello@payhost.dev. Chargebacks follow Paystack’s process.{"\n\n"}
          Prohibited use{"\n"}
          Fraud, sanctioned activity, and abuse of test systems in live mode are forbidden. We may freeze wallets for suspected abuse.{"\n\n"}
          Disputes{"\n"}
          If a payment looks wrong, email hello@payhost.dev within 48 hours with the payment reference, amount, and date. Card chargebacks follow Paystack’s process. We will use that reference to check the ledger and the Paystack event.{"\n\n"}
          Contact{"\n"}
          hello@payhost.dev
        </Text>
      </ScrollView>
    </ScreenWithTabBar>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 48 },
  brandRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  logo: { width: 36, height: 36, marginRight: 8 },
  brand: { fontSize: 20, fontWeight: "700", letterSpacing: 1 },
  company: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  tagline: { fontSize: 13, color: "#64748B", marginBottom: 20 },
  heading: { fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 8 },
  body: { fontSize: 15, lineHeight: 22, color: "#334155" },
});
