import { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import axiosClient from "../src/api/axiosClient"; // ← adjust path if needed

export default function ConverterScreen() {
  const router = useRouter();

  const [fromCurrency, setFromCurrency] = useState("NGN");
  const [toCurrency, setToCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      const receivedAmount = res.data.amount_received;

      // Success Toast
      Toast.show({
        type: "success",
        text1: "Conversion Successful ✅",
        text2: `${fromCurrency} ${Number(amount).toLocaleString()} → ${toCurrency} ${Number(receivedAmount).toLocaleString()}`,
        visibilityTime: 3000,
        position: "top",
      });

      // Clear input
      setAmount("");

      // Automatically return to homepage
      setTimeout(() => {
        router.replace("/"); // change to "/(tabs)" or "/(tabs)/home" if needed
      }, 800);

    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Conversion failed";
      setError(errorMsg);

      Toast.show({
        type: "error",
        text1: "Conversion Failed",
        text2: errorMsg,
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Currency Converter</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>From:</Text>
          <TextInput
            value={fromCurrency}
            onChangeText={setFromCurrency}
            mode="outlined"
            placeholder="e.g. NGN"
            style={styles.input}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>To:</Text>
          <TextInput
            value={toCurrency}
            onChangeText={setToCurrency}
            mode="outlined"
            placeholder="e.g. USD"
            style={styles.input}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount:</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            placeholder="Enter amount"
          />
        </View>

        {error ? (
          <HelperText type="error" visible={true}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleConvert}
          disabled={loading}
          loading={loading}
          style={styles.button}
        >
          {loading ? "Converting..." : "Convert"}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  form: {
    padding: 24,
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 32,
    fontSize: 22,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    color: "#64748B",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 16,
    borderRadius: 10,
    paddingVertical: 6,
  },
});