import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { getOptimizedImageUrl } from "../../services/cloudinary.js";

export default function ListingCard({ listing, style }) {
  const locationDisplay = listing.location?.area
    ? `${listing.location.area}, ${listing.location.city || "Mumbai"}`
    : listing.location || "";
  const ownerName = listing.owner?.displayName || listing.owner?.name || "Owner";
  const ownerRating = listing.owner?.rating || null;
  const categoryLabel = listing.category || "Uncategorized";
  const imageUrl = listing.images?.[0];

  return (
    <Pressable style={[styles.card, style]}>
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image
            source={{ uri: getOptimizedImageUrl(imageUrl, { width: 400, height: 533 }) }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.imageFallbackEmoji}>🪭</Text>
          </View>
        )}

        <View style={styles.imageDarkGradient} pointerEvents="none" />

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText} numberOfLines={1}>{categoryLabel}</Text>
        </View>

        {ownerRating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingStar}>★</Text>
            <Text style={styles.ratingText}>{ownerRating}</Text>
          </View>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.priceText}>
            ₹{listing.pricePerDay}
            <Text style={styles.priceUnit}> /day</Text>
          </Text>
          {listing.size ? (
            <View style={styles.sizeBadge}>
              <Text style={styles.sizeBadgeText}>{listing.size}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <View style={styles.footerBottomRow}>
          <Text style={styles.location} numberOfLines={1}>{locationDisplay}</Text>
          <Text style={styles.owner} numberOfLines={1}>{ownerName}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: "#fff",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(232,224,213,0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageWrap: { aspectRatio: 3 / 4, backgroundColor: "#F0EBE3" },
  imageFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFE4D4",
  },
  imageFallbackEmoji: { fontSize: 40, opacity: 0.4 },
  imageDarkGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.16)",
  },
  categoryBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    maxWidth: "70%",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryBadgeText: { fontSize: 9, fontWeight: "800", color: "#1A1A1A", textTransform: "uppercase", letterSpacing: 0.6 },
  ratingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingStar: { fontSize: 10, color: "#FBBF24" },
  ratingText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  priceRow: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  priceText: { fontSize: 18, fontWeight: "900", color: "#fff" },
  priceUnit: { fontSize: 11, fontWeight: "500", color: "rgba(255,255,255,0.7)" },
  sizeBadge: { backgroundColor: "rgba(212,175,55,0.92)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  sizeBadgeText: { fontSize: 9, fontWeight: "800", color: "#1A1A1A", textTransform: "uppercase" },

  footer: { padding: 14 },
  title: { fontSize: 14, fontWeight: "800", color: "#1A1A1A", marginBottom: 6 },
  footerBottomRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  location: { fontSize: 11, color: "#888", flex: 1 },
  owner: { fontSize: 10, color: "#AAA", fontWeight: "500" },
});
