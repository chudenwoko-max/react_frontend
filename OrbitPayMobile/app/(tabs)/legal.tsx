import { ScrollView, StyleSheet, Text } from "react-native";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

export default function Legal() {
  return (
    <ScreenWithTabBar>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Legal</Text>

        <Text style={styles.heading}>Privacy Policy</Text>
        <Text style={styles.body}>
          Payhost (“we”, “us”) collects and processes personal data to provide wallet, payment, and related services.{"\n\n"}
          We collect account information, transaction data, device information, and KYC documents you submit.{"\n\n"}
          Data is used to operate the service, prevent fraud, meet regulatory obligations, and improve the product.{"\n\n"}
          We do not sell your personal data. We share it only with payment partners, regulators, or as required by law.{"\n\n"}
          You may request access or deletion of your data by contacting support@payhost.dev.{"\n\n"}
          This policy may be updated; continued use of the app constitutes acceptance of the revised policy.
        </Text>

        <Text style={styles.heading}>Terms & Conditions</Text>
        <Text style={styles.body}>
          By using Payhost you agree to these terms.{"\n\n"}
          You must be at least 18 and provide accurate information. You are responsible for keeping your PIN and device secure.{"\n\n"}
          Payhost provides a digital wallet and payment facilitation service. We may suspend or freeze accounts for suspected fraud or regulatory reasons.{"\n\n"}
          Fees, limits, and supported services are shown in the app and may change.{"\n\n"}
          To the extent permitted by law, Payhost is not liable for indirect or consequential losses.{"\n\n"}
          These terms are governed by the laws of the Federal Republic of Nigeria.{"\n\n"}
          Contact support@payhost.dev for questions.
        </Text>
      </ScrollView>
    </ScreenWithTabBar>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  heading: { fontSize: 18, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  body: { fontSize: 15, lineHeight: 22, color: "#334155" },
});
