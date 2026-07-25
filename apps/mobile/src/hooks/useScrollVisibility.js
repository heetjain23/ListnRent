import { useState } from "react";
import {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";

const DURATION = 280; // ms, within the 250-300 range requested
const EASE = Easing.out(Easing.cubic);
const DIRECTION_THRESHOLD = 4; // px of movement before reacting - kills jitter/flicker

/**
 * One shared scroll position + the onScroll prop for an Animated
 * ScrollView/FlatList. Created once (see ScrollContext) and read by both
 * the top and bottom bars, so there's a single scroll listener per screen
 * instead of one per bar.
 */
export function useScrollY() {
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  return { scrollY, onScroll };
}

/**
 * Hide-on-scroll-down / show-on-scroll-up animation, shared by both bars.
 *
 * @param scrollY reanimated shared value from useScrollY()
 * @param size    bar's own height in px - how far it must translate to hide
 * @param edge    'top' | 'bottom' - which screen edge the bar hides towards
 */
export function useHideOnScroll(scrollY, size, edge = "top") {
  const translateY = useSharedValue(0);
  const prevY = useSharedValue(0);
  const [hidden, setHidden] = useState(false);
  const sign = edge === "top" ? -1 : 1;

  useAnimatedReaction(
    () => scrollY.value,
    (y) => {
      const clamped = Math.max(y, 0); // ignore iOS overscroll/bounce
      const delta = clamped - prevY.value;

      if (clamped <= 0) {
        translateY.value = withTiming(0, { duration: DURATION, easing: EASE });
        runOnJS(setHidden)(false);
      } else if (delta > DIRECTION_THRESHOLD && clamped > size) {
        translateY.value = withTiming(sign * size, { duration: 260, easing: EASE });
        runOnJS(setHidden)(true);
      } else if (delta < -DIRECTION_THRESHOLD) {
        translateY.value = withTiming(0, { duration: DURATION, easing: EASE });
        runOnJS(setHidden)(false);
      }

      prevY.value = clamped;
    },
    [size, edge]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // `hidden` (JS-thread state) is only used to drop pointerEvents while
  // off-screen, so a hidden bar can't eat touches.
  return { animatedStyle, hidden };
}
