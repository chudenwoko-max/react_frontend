import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import axiosClient from "../src/api/axiosClient";

export default function ConverterScreen() {
  const [fromCurrency, setFromCurrency] = useState("NGN");
  const [toCurrency, setToCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = async () => {
    if (!amount) {
      setError("Enter an amount");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.post("wallets/convert/", {
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount,
      });
      setResult(res.data.converted_amount || res.data.result || res.data.amount);
    } catch (err: any) {
      setError(err.response?.data?.error || "Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Currency Converter</Text>
      <Text style={styles.subtitle}>Convert between your wallets</Text>

      <TextInput label="From Currency (NGN, USD, GBP, EUR)" value={fromCurrency} onChangeText={setFromCurrency} mode="outlined" autoCapitalize="characters" style={styles.input} />
      <TextInput label="To Currency" value={toCurrency} onChangeText={setToCurrency} mode="outlined" autoCapitalize="characters" style={styles.input} />
      <TextInput label="Amount" value={amount} onChangeText={setAmount} mode="outlined" keyboardType="numeric" style={styles.input} />

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Button mode="contained" onPress={handleConvert} loading={loading} style={styles.button}>
        Convert
      </Button>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Converted Amount</Text>
          <Text style={styles.resultValue}>{result}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  inner: { padding: 20, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: "700", color: "#0F172A" },
  subtitle: { fontSize: 15, color: "#64748B", marginBottom: 24 },
  input: { marginBottom: 14 },
  button: { marginTop: 8, borderRadius: 10 },
  resultCard: { marginTop: 24, backgroundColor: "#0F172A", borderRadius: 16, padding: 20 },
  resultLabel: { color: "#94A3B8", fontSize: 14 },
  resultValue: { color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 6 },
});