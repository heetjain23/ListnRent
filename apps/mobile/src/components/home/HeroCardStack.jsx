import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const CARDS = [
  { color: "#8B4513", rotate: "-8deg", translateX: -18, translateY: 8, zIndex: 1 },
  { color: "#00342B", rotate: "9deg", translateX: 18, translateY: 4, zIndex: 2 },
  { color: "#C8622A", rotate: "2deg", translateX: 0, translateY: 0, zIndex: 3 }, // front card
];

const FRONT_CARD = {
  category: "NAVRATRI",
  price: "Rs 1000/day",
  title: "Ghagracholi",
  location: "Dadar, Mumbai",
};

export default function HeroCardStack() {
  return (
    <View style={styles.container}>
      {CARDS.map((card, i) => {
        const isFront = i === CARDS.length - 1;
        return (
          <View
            key={i}
            style={[
              styles.cardSlot,
              {
                zIndex: card.zIndex,
                transform: [
                  { translateX: card.translateX },
                  { translateY: card.translateY },
                  { rotate: card.rotate },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[card.color, `${card.color}dd`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {isFront && (
                <View style={styles.cardOverlay}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.cardCategory}>{FRONT_CARD.category}</Text>
                    <View style={styles.pricePill}>
                      <Text style={styles.pricePillText}>{FRONT_CARD.price}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardTitle}>{FRONT_CARD.title}</Text>
                  <View style={styles.cardBottomRow}>
                    <Text style={styles.cardLocation}>{FRONT_CARD.location}</Text>
                    <Text style={styles.cardView}>View -&gt;</Text>
                  </View>
                </View>
              )}
            </LinearGradient>
          </View>
        );
      })}

      {/* Floating "120+ Outfits" badge — top right, matches web's gold pill */}
      <View style={styles.outfitsBadge}>
        <Text style={styles.outfitsBadgeText}>120+ Outfits</Text>
      </View>

      {/* Reviews badge — bottom left, frosted white card with star rating */}
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

const CARD_WIDTH = 212;
const CARD_HEIGHT = 292;

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH + 40,
    height: CARD_HEIGHT + 40,
    alignItems: "center",
    justifyContent: "center",
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
  cardLocation: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.82)" },
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