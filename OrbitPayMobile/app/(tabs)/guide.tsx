import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import { PAYHOST_GUIDE } from "../../src/data/payhostGuide";

export default function Guide() {
  return (
    <ScreenWithTabBar>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Payhost Guide</Text>
        {PAYHOST_GUIDE.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.heading}>{section.title}</Text>
            <Text style={styles.body}>{section.content}</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenWithTabBar>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  section: { marginBottom: 20 },
  heading: { fontSize: 18, fontWeight: "600", marginBottom: 6 },
  body: { fontSize: 15, lineHeight: 22, color: "#334155" },
});
