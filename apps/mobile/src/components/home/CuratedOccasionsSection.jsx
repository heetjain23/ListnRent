import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { CLOUDINARY_IMAGES } from "../../constants/imageConstants.js";

const OCCASIONS = [
  { id: "weddings", title: "Weddings", subtitle: "Glamorous looks for the big day", tag: "Bridal & Groom", icon: "💍", bgImage: CLOUDINARY_IMAGES.WEDDING, accentColor: "#8B4513" },
  { id: "parties", title: "Parties", subtitle: "Chic looks & cocktail wear", tag: "Evening Glam", icon: "🎉", bgImage: CLOUDINARY_IMAGES.PARTIES, accentColor: "#00342B" },
  { id: "festivals", title: "Festivals", subtitle: "Vibrant looks you need", tag: "Cultural Wear", icon: "✨", bgImage: CLOUDINARY_IMAGES.FESTIVALS, accentColor: "#C8622A" },
];

export default function CuratedOccasionsSection() {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowBadge}>
            <Text style={styles.eyebrowBadgeText}>Curated</Text>
          </View>
          <Text style={styles.eyebrowText}>Dressed for Every Celebration</Text>
        </View>
        <Text style={styles.heading}>Curated Occasions</Text>
        <View style={styles.underline} />
      </View>

      <View style={styles.cardsColumn}>
        {OCCASIONS.map((occasion) => (
          <Pressable key={occasion.id} style={styles.card}>
            <Image
              source={{ uri: occasion.bgImage }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.cardOverlay} pointerEvents="none" />

            <View style={styles.cardTag}>
              <Text style={styles.cardTagText}>{occasion.tag}</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardIcon}>{occasion.icon}</Text>
              <Text style={styles.cardTitle}>{occasion.title}</Text>
              <Text style={styles.cardSubtitle}>{occasion.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingVertical: 40, paddingHorizontal: 24, backgroundColor: "#FDFAF7" },
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

  cardsColumn: { gap: 16 },
  card: {
    height: 180,
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: 18,
    backgroundColor: "#E8DDD1",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  cardTag: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cardTagText: { fontSize: 9, fontWeight: "800", color: "#fff", textTransform: "uppercase", letterSpacing: 0.8 },
  cardContent: {},
  cardIcon: { fontSize: 26, marginBottom: 6 },
  cardTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  cardSubtitle: { fontSize: 13, fontWeight: "500", color: "rgba(255,255,255,0.8)", marginTop: 4 },
});
