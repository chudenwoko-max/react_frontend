import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Share, TouchableOpacity } from "react-native";
import { Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axiosClient from "../src/api/axiosClient";

export default function ReferralScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosClient.get("referral/");
        setCode(res.data.code || res.data.referral_code || "");
        setStats(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const shareCode = async () => {
    await Share.share({
      message: `Join OrbitPay with my referral code: ${code}`,
    });
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invite Friends</Text>
      <Text style={styles.subtitle}>Earn rewards when friends join with your code</Text>

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Your Referral Code</Text>
        <Text style={styles.code}>{code || "—"}</Text>
      </View>

      <Button mode="contained" onPress={shareCode} icon="share-variant" style={styles.button}>
        Share Code
      </Button>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total_referrals || 0}</Text>
          <Text style={styles.statLabel}>Total Referrals</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.successful || 0}</Text>
          <Text style={styles.statLabel}>Successful</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 20, paddingTop: 60 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "700", color: "#0F172A" },
  subtitle: { fontSize: 15, color: "#64748B", marginBottom: 28 },
  codeCard: { backgroundColor: "#0F172A", borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 20 },
  codeLabel: { color: "#94A3B8", fontSize: 14 },
  code: { color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 8, letterSpacing: 2 },
  button: { borderRadius: 10, marginBottom: 32 },
  stats: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "700", color: "#0F172A" },
  statLabel: { fontSize: 13, color: "#64748B", marginTop: 4 },
});