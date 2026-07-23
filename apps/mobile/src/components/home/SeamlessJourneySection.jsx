import React from "react";
import { View, Text, StyleSheet } from "react-native";

const STEPS = [
  { id: 1, icon: "📤", title: "Share", description: "Upload your curated wardrobe pieces with style — add photos, set your price, and go live in minutes." },
  { id: 2, icon: "🔍", title: "Discover", description: "Explore exquisite designer looks curated by the best in town — filtered by occasion, size & location." },
  { id: 3, icon: "🎀", title: "Rent", description: "Select your dates and get high-quality garments delivered straight to your door." },
  { id: 4, icon: "↩️", title: "Return", description: "Hassle-free returns with dry cleaning included — send it back and we handle the rest." },
];

export default function SeamlessJourneySection() {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowBadge}>
            <Text style={styles.eyebrowBadgeText}>How It Works</Text>
          </View>
          <Text style={styles.eyebrowText}>Simple, Elegant, Effortless</Text>
        </View>
        <Text style={styles.heading}>A Seamless Journey</Text>
        <View style={styles.underline} />
      </View>

      <View style={styles.grid}>
        {STEPS.map((step) => (
          <View key={step.id} style={styles.card}>
            <Text style={styles.stepNumber}>{step.id}</Text>
            <Text style={styles.icon}>{step.icon}</Text>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingVertical: 40, paddingHorizontal: 24, backgroundColor: "#FAF7F2" },
  header: { marginBottom: 20 },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
    backgroundColor: "rgba(212,175,55,0.08)",
    borderRadius: 20,
    paddingVertical: 4,
    paddingLeft: 6,
    paddingRight: 12,
    marginBottom: 10,
  },
  eyebrowBadge: { backgroundColor: "#D4AF37", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  eyebrowBadgeText: { fontSize: 9, fontWeight: "800", color: "#1A1A1A", textTransform: "uppercase" },
  eyebrowText: { fontSize: 11, fontWeight: "600", color: "#8B7340", textTransform: "uppercase", letterSpacing: 0.6 },
  heading: { fontSize: 26, fontWeight: "900", color: "#1A1A1A" },
  underline: { width: 60, height: 3, borderRadius: 2, backgroundColor: "#D4AF37", marginTop: 8 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  card: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(232,224,213,0.8)",
  },
  stepNumber: { fontSize: 11, fontWeight: "800", color: "#D4AF37", marginBottom: 4 },
  icon: { fontSize: 24, marginBottom: 8 },
  title: { fontSize: 15, fontWeight: "800", color: "#1A1A1A", marginBottom: 6 },
  description: { fontSize: 12, lineHeight: 17, color: "#777" },
});
