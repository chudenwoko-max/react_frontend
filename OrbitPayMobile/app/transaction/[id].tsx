import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axiosClient from "../../src/api/axiosClient";

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        // Try both possible endpoints
        let res;
        try {
          res = await axiosClient.get(`transactions/${id}/`);
        } catch {
          res = await axiosClient.get(`transactions/${id}`);
        }
        setTransaction(res.data);
      } catch (error) {
        console.log("Transaction detail error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTransaction();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Transaction not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCredit =
    transaction.transaction_type === "credit" ||
    transaction.type === "credit" ||
    transaction.transaction_type === "fund";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
      </TouchableOpacity>

      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>
          {isCredit ? "Received" : "Sent"}
        </Text>
        <Text
          style={[
            styles.amount,
            { color: isCredit ? "#16A34A" : "#DC2626" },
          ]}
        >
          {isCredit ? "+" : "-"}₦
          {Number(transaction.amount).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
          })}
        </Text>
        <Text style={styles.status}>
          {transaction.status?.toUpperCase() || "SUCCESS"}
        </Text>
      </View>

      <View style={styles.detailsCard}>
        <DetailRow
          label="Reference"
          value={transaction.reference_id || transaction.reference || "—"}
        />
        <DetailRow
          label="Type"
          value={transaction.transaction_type || transaction.type || "—"}
        />
        <DetailRow
          label="Description"
          value={transaction.description || transaction.note || "—"}
        />
        <DetailRow
          label="Date"
          value={
            transaction.created_at
              ? new Date(transaction.created_at).toLocaleString()
              : "—"
          }
        />
        {transaction.recipient_username && (
          <DetailRow label="Recipient" value={transaction.recipient_username} />
        )}
        {transaction.sender_username && (
          <DetailRow label="Sender" value={transaction.sender_username} />
        )}
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  inner: {
    padding: 20,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  backButton: {
    marginBottom: 20,
  },
  amountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  amount: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 8,
  },
  status: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#16A34A",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  label: {
    fontSize: 14,
    color: "#64748B",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
    maxWidth: "60%",
    textAlign: "right",
  },
  errorText: {
    fontSize: 16,
    color: "#64748B",
  },
  backLink: {
    marginTop: 12,
    color: "#0284C7",
    fontWeight: "600",
  },
});