import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
  import Toast from "react-native-toast-message";

// Remove unused imports
// import { Alert } from "react-native";

export default function ConverterScreen() {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("NGN");
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // You can add any initialization code here if needed
  }, []);
const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
    return;
  }

  setLoading(true);
  setError("");
  try {
      const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      const data = await res.json();

      if (!data.rates[toCurrency]) {
        throw new Error("Conversion rate not found");
      }

      const rate = data.rates[toCurrency];
      const converted = (parseFloat(amount) * rate).toFixed(2);

      setConvertedAmount(converted);
    Toast.show({
      type: "success",
        text1: "Conversion Successful",
        text2: `${amount} ${fromCurrency} = ${converted} ${toCurrency}`,
    });
    } catch (error: any) {
      setError(error.message || "Failed to convert currency");
    Toast.show({
      type: "error",
        text1: "Conversion Error",
        text2: error.message,
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
            placeholder="Select currency"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>To:</Text>
          <TextInput
            value={toCurrency}
            onChangeText={setToCurrency}
            mode="outlined"
            placeholder="Select currency"
            style={styles.input}
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
          style={styles.button}
        >
          {loading ? "Converting..." : "Convert"}
        </Button>

        {convertedAmount && (
          <View style={styles.result}>
            <Text style={styles.resultText}>
              {amount} {fromCurrency} = {convertedAmount} {toCurrency}
            </Text>
          </View>
        )}
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
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    color: "#64748B",
  },
  input: {
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 16,
    borderRadius: 10,
  },
  result: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
  },
  resultText: {
    fontSize: 16,
    color: "#1E293B",
  },
});
