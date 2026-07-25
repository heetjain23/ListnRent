import React from "react";
import { View, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import TopNavbar, { useTopNavbarHeight } from "./TopNavbar";
import { useBottomNavbarHeight } from "./BottomNavbar";
import { useScrollContext } from "../../context/ScrollContext";

/**
 * Drop-in screen shell: renders TopNavbar + an Animated.ScrollView already
 * wired to the shared scroll position, with top/bottom padding reserved so
 * content starts right under the navbar and never hides behind the tab bar.
 */
export default function ScreenScrollView({
  children,
  contentContainerStyle,
  topNavbarProps,
  ...scrollViewProps
}) {
  const { onScroll } = useScrollContext();
  const topHeight = useTopNavbarHeight();
  const bottomHeight = useBottomNavbarHeight();

  return (
    <View style={styles.flex}>
      <TopNavbar {...topNavbarProps} />
      <Animated.ScrollView
        style={styles.flex}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          { paddingTop: topHeight, paddingBottom: bottomHeight + 24 },
          contentContainerStyle,
        ]}
        {...scrollViewProps}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
