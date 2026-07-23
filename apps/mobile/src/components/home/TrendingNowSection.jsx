import React, { useState } from "react";
import { View, Text, FlatList, Dimensions, StyleSheet } from "react-native";
import ListingCard from "../collection/ListingCard.jsx";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 48; // matches Home's 24px horizontal padding

export default function TrendingNowSection({ listings = [], loading = false }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trendingListings = listings.slice(0, 4);

  if (loading) {
    return (
      <View style={styles.section}>
        <SectionHeader />
        <View style={styles.skeletonRow}>
          {[0, 1].map((i) => (
            <View key={i} style={styles.skeletonCard} />
          ))}
        </View>
      </View>
    );
  }

  if (!trendingListings.length) return null;

  const onScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 16));
    setActiveIndex(index);
  };

  return (
    <View style={styles.section}>
      <SectionHeader />

      <FlatList
        data={trendingListings}
        keyExtractor={(item) => item._id || item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.carouselContent}
        renderItem={({ item }) => (
          <ListingCard listing={item} style={{ width: CARD_WIDTH }} />
        )}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
      />

      <View style={styles.dotsRow}>
        {trendingListings.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.accentStrip}>
        {[
          { icon: "🔥", label: "Updated Daily" },
          { icon: "⭐", label: "Top Rated Picks" },
          { icon: "💫", label: "Verified Quality" },
        ].map((item) => (
          <View key={item.label} style={styles.accentItem}>
            <Text style={styles.accentIcon}>{item.icon}</Text>
            <Text style={styles.accentLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SectionHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.eyebrowRow}>
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>Live</Text>
        </View>
        <Text style={styles.eyebrowText}>Most Loved This Week</Text>
      </View>
      <Text style={styles.heading}>Trending Now</Text>
      <View style={styles.underline} />
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
  liveBadge: { backgroundColor: "#D4AF37", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  liveBadgeText: { fontSize: 9, fontWeight: "800", color: "#1A1A1A", textTransform: "uppercase" },
  eyebrowText: { fontSize: 11, fontWeight: "600", color: "#8B7340", textTransform: "uppercase", letterSpacing: 0.6 },
  heading: { fontSize: 26, fontWeight: "900", color: "#1A1A1A" },
  underline: { width: 60, height: 3, borderRadius: 2, backgroundColor: "#D4AF37", marginTop: 8 },

  carouselContent: { paddingRight: 24 },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(212,175,55,0.3)" },
  dotActive: { width: 20, backgroundColor: "#D4AF37" },

  skeletonRow: { flexDirection: "row", gap: 16 },
  skeletonCard: { flex: 1, aspectRatio: 3 / 4, borderRadius: 16, backgroundColor: "#F0EAE0" },

  accentStrip: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 20,
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(212,175,55,0.2)",
  },
  accentItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  accentIcon: { fontSize: 14, color: "#D4AF37" },
  accentLabel: { fontSize: 11, fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: 0.6 },
});
