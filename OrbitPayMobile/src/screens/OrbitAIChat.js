import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import axiosClient from "../src/api/axiosClient";
import { getGuideSystemPrompt } from "../data/payhostGuide";

export default function PayhostAIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const flatListRef = useRef(null);

  const createNewSession = useCallback(async () => {
    const res = await axiosClient.post("chat/sessions/", { title: "Payhost AI Chat" });
    setSessionId(res.data?.id ?? null);
  }, []);

  useEffect(() => {
    createNewSession().catch(() => setSessionId(null));
  }, [createNewSession]);

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axiosClient.post(`chat/sessions/${sessionId}/messages/`, {
        message: userMessage.content,
        system_prompt: getGuideSystemPrompt(),
      });
      const reply = res.data?.reply || "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please check your connection." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser && styles.userText]}>{item.content}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payhost AI</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="planet" size={60} color="#6C63FF" />
            <Text style={styles.emptyTitle}>Hi, I'm Payhost AI</Text>
            <Text style={styles.emptyText}>
              Ask about your balance, spending, savings, KYC, or transactions.
            </Text>
          </View>
        }
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6C63FF" />
          <Text style={styles.loadingText}>Payhost is thinking...</Text>
        </View>
      ) : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask Payhost AI anything..."
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F1A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#1A1A2E",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  messagesList: { padding: 16, paddingBottom: 20 },
  messageBubble: { maxWidth: "80%", padding: 14, borderRadius: 18, marginBottom: 12 },
  userBubble: { backgroundColor: "#6C63FF", alignSelf: "flex-end", borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: "#1E1E2F", alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  messageText: { color: "#E0E0E0", fontSize: 15, lineHeight: 22 },
  userText: { color: "#fff" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyTitle: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 16 },
  emptyText: { color: "#AAA", fontSize: 15, textAlign: "center", marginTop: 8, paddingHorizontal: 40 },
  loadingContainer: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 8 },
  loadingText: { color: "#6C63FF", marginLeft: 8, fontSize: 13 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    backgroundColor: "#1A1A2E",
    borderTopWidth: 1,
    borderTopColor: "#2A2A3C",
  },
  input: {
    flex: 1,
    backgroundColor: "#2A2A3C",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#fff",
    maxHeight: 120,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: "#6C63FF",
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sendButtonDisabled: { backgroundColor: "#444" },
});