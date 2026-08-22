import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { TextInput, Button, HelperText, Menu } from "react-native-paper";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import axiosClient from "../src/api/axiosClient"; // adjust path if needed
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CURRENCIES = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
];

export default function ConverterScreen() {
  const router = useRouter();

  const [fromCurrency, setFromCurrency] = useState("NGN");
  const [toCurrency, setToCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Dropdown visibility
  const [fromMenuVisible, setFromMenuVisible] = useState(false);
  const [toMenuVisible, setToMenuVisible] = useState(false);

  const handleConvert = async () => {
    if (!amount) {
      setError("Enter an amount");
      return;
    }

    if (fromCurrency === toCurrency) {
      setError("Cannot convert to the same currency");
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

      Toast.show({
        type: "success",
        text1: "Conversion Successful ✅",
        text2: `${fromCurrency} ${Number(amount).toLocaleString()} → ${toCurrency} ${Number(receivedAmount).toLocaleString()}`,
        visibilityTime: 3000,
        position: "top",
      });

      setAmount("");

      setTimeout(() => {
        router.replace("/(tabs)");
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

  const renderCurrencySelector = (
    label: string,
    selected: string,
    setSelected: (code: string) => void,
    visible: boolean,
    setVisible: (v: boolean) => void
  ) => {
    const current = CURRENCIES.find((c) => c.code === selected);

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>

        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownText}>
                {current ? `${current.symbol} ${current.code} – ${current.name}` : "Select currency"}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={22} color="#64748B" />
            </TouchableOpacity>
          }
        >
          {CURRENCIES.map((currency) => (
            <Menu.Item
              key={currency.code}
              onPress={() => {
                setSelected(currency.code);
                setVisible(false);
              }}
              title={`${currency.symbol}  ${currency.code} – ${currency.name}`}
            />
          ))}
        </Menu>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Currency Converter</Text>

        {renderCurrencySelector(
          "From",
          fromCurrency,
          setFromCurrency,
          fromMenuVisible,
          setFromMenuVisible
        )}

        {renderCurrencySelector(
          "To",
          toCurrency,
          setToCurrency,
          toMenuVisible,
          setToMenuVisible
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
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
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 16,
    color: "#0F172A",
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