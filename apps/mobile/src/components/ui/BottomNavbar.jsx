import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import Animated from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { House, Search, ShoppingCart, User } from "lucide-react-native";
import { useHideOnScroll } from "../../hooks/useScrollVisibility";
import { useScrollContext } from "../../context/ScrollContext";

const ICONS = { Home: House, Browse: Search, Cart: ShoppingCart, Profile: User };

export const BOTTOM_NAVBAR_CONTENT_HEIGHT = 64;
const FLOAT_MARGIN = 12;

/** Total footprint of the floating bar. Screens use this to pad the bottom
 * of their scroll content so the last item never sits behind it. */
export function useBottomNavbarHeight() {
  const insets = useSafeAreaInsets();
  return BOTTOM_NAVBAR_CONTENT_HEIGHT + FLOAT_MARGIN * 2 + insets.bottom;
}

// Drop-in tabBar for createBottomTabNavigator - gets {state, descriptors,
// navigation} from React Navigation itself, no custom routing logic needed.
export default function BottomNavbar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const totalHeight = BOTTOM_NAVBAR_CONTENT_HEIGHT + FLOAT_MARGIN * 2 + insets.bottom;
  const { scrollY } = useScrollContext();
  const { animatedStyle, hidden } = useHideOnScroll(scrollY, totalHeight, "bottom");

  return (
    <Animated.View
      pointerEvents={hidden ? "none" : "auto"}
      style={[styles.wrapper, { bottom: insets.bottom + FLOAT_MARGIN }, animatedStyle]}
    >
      <BlurView intensity={60} tint="light" style={styles.blur}>
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const focused = state.index === index;
            const Icon = ICONS[route.name];
            const label = options.title ?? route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                android_ripple={{ color: "rgba(0,52,43,0.08)", borderless: true }}
                style={styles.tab}
              >
                <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                  {Icon && (
                    <Icon size={20} color={focused ? "#FAF7F2" : "#9A9A9A"} strokeWidth={2.2} />
                  )}
                </View>
                <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: FLOAT_MARGIN,
    right: FLOAT_MARGIN,
    zIndex: 50,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  blur: {
    height: BOTTOM_NAVBAR_CONTENT_HEIGHT,
    // Android's BlurView support is limited - fall back to a near-opaque tint
    backgroundColor:
      Platform.OS === "android" ? "rgba(251,248,243,0.94)" : "rgba(251,248,243,0.55)",
  },
  row: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  tab: { alignItems: "center", justifyContent: "center", gap: 4, flex: 1 },
  iconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  iconWrapActive: { backgroundColor: "#00342B" },
  label: { fontSize: 10, fontWeight: "700", color: "#9A9A9A" },
  labelActive: { color: "#00342B" },
});
