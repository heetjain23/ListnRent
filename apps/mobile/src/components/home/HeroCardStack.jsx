import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { getOptimizedImageUrl } from "../../services/cloudinary.js";

const FALLBACK_SHOWCASE = [
  { id: null, title: "Bridal Lehenga", category: "Lehenga", pricePerDay: 800, image: "", location: "Mumbai", rotate: -8, x: -24, color: "#8B4513" },
  { id: null, title: "Regal Sherwani", category: "Sherwani", pricePerDay: 1100, image: "", location: "Bandra", rotate: 2, x: 0, color: "#00342B" },
  { id: null, title: "Festive Silk Saree", category: "Saree", pricePerDay: 900, image: "", location: "Juhu", rotate: 9, x: 24, color: "#C8622A" },
];

const LOADING_SHOWCASE = [
  { id: "loading-1", title: "Loading outfit...", category: "Curated", pricePerDay: "--", image: "", location: "Mumbai", rotate: -8, x: -24, color: "#8B4513" },
  { id: "loading-2", title: "Loading outfit...", category: "Curated", pricePerDay: "--", image: "", location: "Mumbai", rotate: 2, x: 0, color: "#00342B" },
  { id: "loading-3", title: "Loading outfit...", category: "Curated", pricePerDay: "--", image: "", location: "Mumbai", rotate: 9, x: 24, color: "#C8622A" },
];

const getListingLocation = (listing) => {
  if (listing?.location?.area) {
    return `${listing.location.area}, ${listing.location.city || "Mumbai"}`;
  }
  return listing?.location || "Mumbai";
};

const buildShowcaseCards = (listings = []) => {
  const realCards = listings
    .filter((listing) => listing?._id || listing?.id)
    .sort((a, b) => Number(Boolean(b.images?.[0])) - Number(Boolean(a.images?.[0])))
    .slice(0, 3)
    .map((listing, index) => ({
      id: listing._id || listing.id,
      title: listing.title || "Designer Outfit",
      category: listing.category || "Curated",
      pricePerDay: listing.pricePerDay || 800,
      image: listing.images?.[0] || "",
      location: getListingLocation(listing),
      rotate: [-8, 2, 9][index],
      x: [-24, 0, 24][index],
      color: ["#8B4513", "#00342B", "#C8622A"][index],
    }));

  return realCards.length ? realCards : FALLBACK_SHOWCASE;
};

const CONTAINER_WIDTH = 272;
const CONTAINER_HEIGHT = 368;
const CARD_WIDTH = 212;
const CARD_HEIGHT = 292;
const LEFT_BASE = 16;

export default function HeroCardStack({ listings = [], loading = false }) {
  const hasRealListings = listings.some((l) => l?._id || l?.id);
  const cards = hasRealListings
    ? buildShowcaseCards(listings)
    : loading
      ? LOADING_SHOWCASE
      : FALLBACK_SHOWCASE;

  const outfitsBadgeLabel = hasRealListings ? `${Math.max(listings.length, 120)}+ Outfits` : "120+ Outfits";

  return (
    <View style={styles.container}>
      {cards.map((card, i) => {
        // Web compounds two offsets: an index-based cascade (top: i*12,
        // left: i*6 + leftBase) AND the per-card x value (-24/0/24) on
        // top of that. Both are needed for the fan-out to look right —
        // x alone (what the previous version did) understates the cascade.
        const top = i * 12;
        const left = i * 6 + LEFT_BASE + card.x;

        return (
          <View
            key={card.id || i}
            style={[
              styles.cardSlot,
              { top, left, zIndex: i, transform: [{ rotate: `${card.rotate}deg` }] },
            ]}
          >
            {card.image ? (
              <View style={styles.card}>
                <Image
                  source={{ uri: getOptimizedImageUrl(card.image, { width: 360, height: 500 }) }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={200}
                />
                <View style={styles.darkOverlay} pointerEvents="none" />
                <CardInfo card={card} loading={loading} />
              </View>
            ) : (
              <LinearGradient
                colors={[card.color, `${card.color}dd`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <View style={styles.darkOverlay} pointerEvents="none" />
                <CardInfo card={card} loading={loading} />
              </LinearGradient>
            )}
          </View>
        );
      })}

      <View style={styles.outfitsBadge}>
        <Text style={styles.outfitsBadgeText}>{outfitsBadgeLabel}</Text>
      </View>

      <View style={styles.reviewsBadge}>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Text key={s} style={styles.star}>★</Text>
          ))}
        </View>
        <Text style={styles.reviewsHeadline}>340+ Happy Renters</Text>
        <Text style={styles.reviewsSubtext}>Avg ₹4,200 savings</Text>
      </View>
    </View>
  );
}

function CardInfo({ card, loading }) {
  return (
    <View style={styles.cardOverlay}>
      <View style={styles.cardTopRow}>
        <Text style={styles.cardCategory}>{card.category}</Text>
        <View style={styles.pricePill}>
          <Text style={styles.pricePillText}>
            {loading ? "Loading" : `Rs ${card.pricePerDay}/day`}
          </Text>
        </View>
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>{card.title}</Text>
      <View style={styles.cardBottomRow}>
        <Text style={styles.cardLocation} numberOfLines={1}>{card.location}</Text>
        <Text style={styles.cardView}>{loading ? "Loading..." : "View ->"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CONTAINER_WIDTH,
    height: CONTAINER_HEIGHT,
    alignSelf: "center",
    marginTop: 8,
  },
  cardSlot: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  cardOverlay: { gap: 6 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardCategory: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#D4AF37",
    textTransform: "uppercase",
  },
  pricePill: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pricePillText: { fontSize: 10, fontWeight: "800", color: "#1A1A1A" },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginTop: 2,
  },
  cardBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  cardLocation: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.82)", flexShrink: 1 },
  cardView: { fontSize: 11, fontWeight: "800", color: "#FAF7F2" },

  outfitsBadge: {
    position: "absolute",
    top: -8,
    right: 4,
    zIndex: 10,
    backgroundColor: "#D4AF37",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  outfitsBadgeText: { fontSize: 11, fontWeight: "800", color: "#1A1A1A" },

  reviewsBadge: {
    position: "absolute",
    bottom: 10,
    left: -8,
    zIndex: 10,
    minWidth: 104,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0,52,43,0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  starsRow: { flexDirection: "row", gap: 2, marginBottom: 4 },
  star: { fontSize: 10, color: "#D4AF37" },
  reviewsHeadline: { fontSize: 12, fontWeight: "700", color: "#00342B" },
  reviewsSubtext: { fontSize: 10, color: "#888", marginTop: 2 },
});