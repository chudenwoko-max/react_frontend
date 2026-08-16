import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { TextInput, Button, HelperText, SegmentedButtons } from "react-native-paper";
import axiosClient from "../src/api/axiosClient";

export default function BillsScreen() {
  const [type, setType] = useState("airtime");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [meter, setMeter] = useState("");
  const [smartcard, setSmartcard] = useState("");
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
  if (!amount || Number(amount) <= 0) {
    setError("Please enter a valid amount");
    return;
  }

  setLoading(true);
  setError("");

  try {
    let endpoint = "";
    let payload: any = {};

    if (type === "airtime") {
      if (!phone || !provider) {
        setError("Phone number and network are required");
        setLoading(false);
        return;
      }
      endpoint = "bills/airtime/";
      payload = {
        provider: provider.toUpperCase(),
        phone: phone,
        amount: amount,
      };
    } else if (type === "data") {
      if (!phone || !provider) {
        setError("Phone number and network are required");
        setLoading(false);
        return;
      }
      endpoint = "bills/data/";
      payload = {
        provider: provider.toUpperCase(),
        phone: phone,
        amount: amount,
        package_name: "", // optional
      };
    } else if (type === "electricity") {
      if (!meter || !provider) {
        setError("Meter number and provider are required");
        setLoading(false);
        return;
      }
      endpoint = "bills/electricity/";
      payload = {
        provider: provider,
        meter_number: meter,
        amount: amount,
        meter_type: "prepaid",
      };
    } else if (type === "cable") {
      if (!smartcard || !provider) {
        setError("Smartcard number and provider are required");
        setLoading(false);
        return;
      }
      endpoint = "bills/cable/";
      payload = {
        provider: provider.toUpperCase(),
        smartcard_number: smartcard,
        amount: amount,
        package_name: "",
      };
    }

    const res = await axiosClient.post(endpoint, payload);

    window.alert(res.data.message || "Payment successful!");
    
    // Clear form
    setPhone("");
    setAmount("");
    setMeter("");
    setSmartcard("");
    setProvider("");
  } catch (err: any) {
    console.log("Bill payment error:", err.response?.data);
    const message =
      err.response?.data?.error ||
      err.response?.data?.detail ||
      "Payment failed. Please try again.";
    setError(message);
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Bill Payments</Text>

      <SegmentedButtons
        value={type}
        onValueChange={setType}
        buttons={[
          { value: "airtime", label: "Airtime" },
          { value: "data", label: "Data" },
          { value: "electricity", label: "Electricity" },
          { value: "cable", label: "Cable" },
        ]}
        style={{ marginBottom: 20 }}
      />

      {(type === "airtime" || type === "data") && (
        <>
          <TextInput label="Phone Number" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" style={styles.input} />
          <TextInput label="Network (MTN, Glo, Airtel, 9mobile)" value={provider} onChangeText={setProvider} mode="outlined" style={styles.input} />
        </>
      )}

      {type === "electricity" && (
        <>
          <TextInput label="Meter Number" value={meter} onChangeText={setMeter} mode="outlined" style={styles.input} />
          <TextInput label="Provider (e.g. IKEDC)" value={provider} onChangeText={setProvider} mode="outlined" style={styles.input} />
        </>
      )}

      {type === "cable" && (
        <>
          <TextInput label="Smartcard Number" value={smartcard} onChangeText={setSmartcard} mode="outlined" style={styles.input} />
          <TextInput label="Provider (DSTV, GOTV, Startimes)" value={provider} onChangeText={setProvider} mode="outlined" style={styles.input} />
        </>
      )}

      <TextInput label="Amount (NGN)" value={amount} onChangeText={setAmount} mode="outlined" keyboardType="numeric" style={styles.input} />

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Button mode="contained" onPress={handlePay} loading={loading} style={styles.button}>
        Pay Now
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  inner: { padding: 20, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: "700", color: "#0F172A", marginBottom: 20 },
  input: { marginBottom: 14 },
  button: { marginTop: 10, borderRadius: 10 },
});