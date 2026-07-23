import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

/**
 * Lean port of apps/web/client/src/components/layout/Footer.jsx. Same
 * copy, same structure (brand column, 3 link columns, bottom strip w/
 * trust badges), same 3-column link layout web itself uses even at
 * mobile width (its grid-cols-3 isn't behind a md: prefix — this isn't
 * a new mobile-specific design, just what's actually there).
 *
 * Dropped: ambient background glow/grid/dot decorations, hover states,
 * scroll-in motion — all pure polish, no functional role, consistent
 * with every other section so far.
 *
 * Social icons use emoji instead of react-icons (web's FiInstagram/
 * FiTwitter/etc): lucide-react-native is already installed for the tab
 * bar, but lucide dropped brand icons (trademark reasons) so Instagram/
 * Twitter aren't available there either. Rather than pull in a new icon
 * library for 4 icons, this matches the emoji convention every other
 * section already uses. Links are static — no destination screens exist
 * yet, same as CTAs elsewhere in the app so far.
 */
const LINK_COLUMNS = [
  { heading: "The Brand", links: ["Sustainability", "Brand Story", "Collection"] },
  { heading: "Support", links: ["List an Outfit", "Sign In", "Browse Rentals"] },
  { heading: "Explore", links: ["Wedding Outfits", "Lehenga Rentals", "Saree Rentals", "Sherwani Rentals"] },
];

const SOCIALS = [
  { icon: "📷", label: "Instagram" },
  { icon: "🐦", label: "Twitter" },
  { icon: "🔗", label: "Share" },
  { icon: "🌐", label: "Language" },
];

const TRUST_BADGES = [
  { icon: "🏆", label: "Mumbai's #1 Ethnic Rental" },
  { icon: "🌿", label: "100% Sustainable" },
  { icon: "⭐", label: "4.9 / 5 Rating" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.footer}>
      <View style={styles.topAccentLine} />

      {/* Brand column */}
      <View style={styles.brandBlock}>
        <View style={styles.logoRow}>
          <Text style={styles.logo}>
            Listn<Text style={styles.logoAccent}>Rent</Text>
          </Text>
          <View style={styles.ethnicTag}>
            <Text style={styles.ethnicTagText}>Ethnic Wear</Text>
          </View>
        </View>
        <View style={styles.logoUnderline} />

        <Text style={styles.description}>
          Mumbai's premier destination for luxury ethnic rentals.
          Celebrating tradition, embracing sustainability, one outfit at a
          time.
        </Text>

        <View style={styles.mumbaiTag}>
          <View style={styles.mumbaiTagBadge}>
            <Text style={styles.mumbaiTagBadgeText}>Mumbai</Text>
          </View>
          <Text style={styles.mumbaiTagLabel}>The Curated Heritage</Text>
        </View>

        <View style={styles.socialsRow}>
          {SOCIALS.map((social) => (
            <Pressable key={social.label} style={styles.socialBtn}>
              <Text style={styles.socialIcon}>{social.icon}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Link columns */}
      <View style={styles.linksRow}>
        {LINK_COLUMNS.map((col) => (
          <View key={col.heading} style={styles.linkColumn}>
            <Text style={styles.linkHeading}>{col.heading}</Text>
            {col.links.map((label) => (
              <Pressable key={label}>
                <Text style={styles.link}>{label}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>

      {/* Bottom strip */}
      <View style={styles.bottomStrip}>
        <Text style={styles.copyright}>
          © {currentYear} ListnRent Mumbai. The Curated Heritage.
        </Text>

        <View style={styles.trustRow}>
          {TRUST_BADGES.map((badge) => (
            <View key={badge.label} style={styles.trustItem}>
              <Text style={styles.trustIcon}>{badge.icon}</Text>
              <Text style={styles.trustLabel}>{badge.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { backgroundColor: "#001F1A", paddingBottom: 32 },
  topAccentLine: { height: 3, backgroundColor: "#D4AF37" },

  brandBlock: { paddingHorizontal: 24, paddingTop: 36, gap: 16 },
  logoRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10 },
  logo: { fontSize: 22, fontWeight: "900", color: "#fff" },
  logoAccent: { color: "#D4AF37" },
  ethnicTag: {
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.35)",
    backgroundColor: "rgba(212,175,55,0.1)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  ethnicTagText: { fontSize: 9, fontWeight: "800", color: "#D4AF37", textTransform: "uppercase", letterSpacing: 0.8 },
  logoUnderline: { width: 60, height: 3, borderRadius: 2, backgroundColor: "#D4AF37" },

  description: { fontSize: 13, lineHeight: 20, color: "rgba(255,255,255,0.5)" },

  mumbaiTag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
    backgroundColor: "rgba(212,175,55,0.08)",
    borderRadius: 20,
    paddingVertical: 4,
    paddingLeft: 6,
    paddingRight: 12,
  },
  mumbaiTagBadge: { backgroundColor: "#D4AF37", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  mumbaiTagBadgeText: { fontSize: 8, fontWeight: "800", color: "#1A1A1A", textTransform: "uppercase" },
  mumbaiTagLabel: { fontSize: 10, fontWeight: "600", color: "rgba(212,175,55,0.7)", textTransform: "uppercase", letterSpacing: 0.6 },

  socialsRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  socialBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: { fontSize: 16 },

  linksRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginTop: 32,
    gap: 12,
  },
  linkColumn: { flex: 1, gap: 12 },
  linkHeading: { fontSize: 10, fontWeight: "800", color: "#D4AF37", textTransform: "uppercase", letterSpacing: 1 },
  link: { fontSize: 12, fontWeight: "500", color: "rgba(255,255,255,0.55)", marginBottom: 2 },

  bottomStrip: {
    marginTop: 40,
    paddingHorizontal: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    gap: 16,
  },
  copyright: { fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center" },
  trustRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 16 },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  trustIcon: { fontSize: 11, color: "#D4AF37" },
  trustLabel: { fontSize: 9, fontWeight: "600", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 0.6 },
});
