import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import TopBar from "../components/home/TopBar.jsx";
import HeroCardStack from "../components/home/HeroCardStack.jsx";
import { useListings } from "../hooks/useListings.js";

export default function Home() {
  const { listings, loading } = useListings({ limit: 4, sortBy: "trending" });

  return (
    <LinearGradient
      colors={["#FBF8F3", "#F7F1E7", "#EFE4D4"]}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TopBar />

        <HeroCardStack listings={listings} loading={loading} />

        {/* NEW badge pill */}
        <View style={styles.newBadgeRow}>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>New</Text>
          </View>
          <Text style={styles.newBadgeLabel}>The Curated Heritage Platform</Text>
        </View>

        {/* Headline */}
        <View style={styles.headlineBlock}>
          <Text style={styles.headline}>
            Rent <Text style={styles.headlineGreen}>Designer</Text>
          </Text>
          <Text style={styles.headline}>
            Ethnic <Text style={styles.headlineOrange}>Wear</Text>
          </Text>
          <Text style={styles.headline}>in Mumbai</Text>
        </View>

        {/* Gold underline */}
        <View style={styles.underline} />

        {/* Subtext */}
        <Text style={styles.subtext}>
          Rent lehengas, sarees, sherwanis, jodhpuris and party wear for
          weddings, sangeet nights, festivals and formal events. Choose
          dates, review measurements and book occasion wear online.
        </Text>

        {/* CTAs */}
        <View style={styles.ctaRow}>
          <Pressable style={styles.primaryCta}>
            <Text style={styles.primaryCtaText}>Explore Collection →</Text>
          </Pressable>
          <Pressable style={styles.secondaryCta}>
            <Text style={styles.secondaryCtaText}>+ List Your Outfit</Text>
          </Pressable>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>120+</Text>
            <Text style={styles.statLabel}>Outfits</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>340+</Text>
            <Text style={styles.statLabel}>Renters</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>₹4,200</Text>
            <Text style={styles.statLabel}>Avg Savings</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 40, alignItems: "center" },

  newBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
    backgroundColor: "rgba(212,175,55,0.1)",
    borderRadius: 30,
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 16,
  },
  newBadge: {
    backgroundColor: "#D4AF37",
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#1A1A1A",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  newBadgeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8B7340",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  headlineBlock: { marginTop: 20, alignItems: "center" },
  headline: {
    fontSize: 34,
    fontWeight: "900",
    color: "#1A1A1A",
    lineHeight: 40,
    textAlign: "center",
  },
  headlineGreen: { color: "#00342B" },
  headlineOrange: { color: "#C8622A" },

  underline: {
    width: 90,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#D4AF37",
    marginTop: 14,
  },

  subtext: {
    marginTop: 20,
    paddingHorizontal: 28,
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
    textAlign: "center",
  },

  ctaRow: { marginTop: 24, width: "100%", paddingHorizontal: 24, gap: 12 },
  primaryCta: {
    backgroundColor: "#00342B",
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#00342B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryCtaText: { color: "#FAF7F2", fontSize: 14, fontWeight: "800", letterSpacing: 0.5 },
  secondaryCta: {
    borderWidth: 2,
    borderColor: "#D4AF37",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryCtaText: { color: "#00342B", fontSize: 14, fontWeight: "800" },

  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    marginTop: 28,
  },
  statBlock: { alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "900", color: "#00342B" },
  statLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});