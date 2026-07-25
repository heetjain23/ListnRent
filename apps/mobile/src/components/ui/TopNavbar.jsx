import React from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHideOnScroll } from "../../hooks/useScrollVisibility";
import { useScrollContext } from "../../context/ScrollContext";

export const TOP_NAVBAR_CONTENT_HEIGHT = 56;

/** Total navbar height (safe-area + content). Screens use this to reserve
 * the exact same space at the top of their scroll content, so the hero
 * sits directly under the bar with zero layout jump on mount. */
export function useTopNavbarHeight() {
  const insets = useSafeAreaInsets();
  return insets.top + TOP_NAVBAR_CONTENT_HEIGHT;
}

export default function TopNavbar({ left, right }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const height = insets.top + TOP_NAVBAR_CONTENT_HEIGHT;
  const { scrollY } = useScrollContext();
  const { animatedStyle, hidden } = useHideOnScroll(scrollY, height, "top");

  return (
    <Animated.View
      pointerEvents={hidden ? "none" : "auto"}
      style={[styles.container, { height, paddingTop: insets.top }, animatedStyle]}
    >
      {left ?? (
        <Text style={styles.logo}>
          Listn<Text style={styles.logoAccent}>Rent</Text>
        </Text>
      )}

      {right ?? (
        <Pressable onPress={() => navigation.navigate("Login")} style={styles.signInPill}>
          <Text style={styles.signInText}>Sign In</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#FBF8F3",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  logo: { fontSize: 22, fontWeight: "900", color: "#1A1A1A" },
  logoAccent: { color: "#00342B" },
  signInPill: {
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.4)",
    backgroundColor: "rgba(212,175,55,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  signInText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#8B7340",
    textTransform: "uppercase",
  },
});
