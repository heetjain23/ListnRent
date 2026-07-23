import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { api } from "../../services/api.js";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setMessage("");

    try {
      await api("/api/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setIsSuccess(true);
      setMessage("Successfully subscribed to our newsletter!");
      setEmail("");
    } catch (err) {
      setIsSuccess(false);
      setMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.eyebrowRow}>
        <View style={styles.eyebrowBadge}>
          <Text style={styles.eyebrowBadgeText}>Atelier</Text>
        </View>
        <Text style={styles.eyebrowText}>Join the Inner Circle</Text>
      </View>

      <Text style={styles.heading}>Elegance with a{"\n"}Conscience.</Text>
      <View style={styles.underline} />

      <Text style={styles.body}>
        Subscribe for early access to new arrivals, styling edits, and
        member-only offers from ListnRent's curated wardrobe.
      </Text>

      <View style={styles.form}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Your email address"
          placeholderTextColor="rgba(255,255,255,0.5)"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <Pressable style={styles.button} onPress={handleSubscribe} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#1A1A1A" />
          ) : (
            <Text style={styles.buttonText}>Subscribe</Text>
          )}
        </Pressable>
      </View>

      {message ? (
        <Text style={[styles.message, isSuccess ? styles.messageSuccess : styles.messageError]}>
          {message}
        </Text>
      ) : null}

      <Text style={styles.disclaimer}>No spam. Unsubscribe anytime.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingVertical: 44, paddingHorizontal: 24, backgroundColor: "#00342B" },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.35)",
    backgroundColor: "rgba(212,175,55,0.1)",
    borderRadius: 20,
    paddingVertical: 4,
    paddingLeft: 6,
    paddingRight: 12,
    marginBottom: 12,
  },
  eyebrowBadge: { backgroundColor: "#D4AF37", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  eyebrowBadgeText: { fontSize: 9, fontWeight: "800", color: "#1A1A1A", textTransform: "uppercase" },
  eyebrowText: { fontSize: 11, fontWeight: "600", color: "rgba(212,175,55,0.8)", textTransform: "uppercase", letterSpacing: 0.6 },

  heading: { fontSize: 30, fontWeight: "900", color: "#fff", lineHeight: 36 },
  underline: { width: 70, height: 3, borderRadius: 2, backgroundColor: "#D4AF37", marginTop: 12 },
  body: { marginTop: 16, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.75)" },

  form: { marginTop: 24, gap: 12 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#D4AF37",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { fontSize: 14, fontWeight: "800", color: "#1A1A1A" },

  message: { marginTop: 12, fontSize: 12, fontWeight: "600" },
  messageSuccess: { color: "#7FE3B4" },
  messageError: { color: "#F3A6A6" },

  disclaimer: { marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "center" },
});
