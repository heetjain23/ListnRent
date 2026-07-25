import React, { createContext, useContext, useMemo } from "react";
import { useScrollY } from "../hooks/useScrollVisibility";

const ScrollContext = createContext(null);

/**
 * Wrap a navigator (see BottomTabs.jsx) so every screen and the custom
 * tab bar read/write the same scroll position instead of each owning one.
 */
export function ScrollProvider({ children }) {
  const { scrollY, onScroll } = useScrollY();
  const value = useMemo(() => ({ scrollY, onScroll }), [scrollY, onScroll]);
  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>;
}

export function useScrollContext() {
  const ctx = useContext(ScrollContext);
  if (!ctx) {
    throw new Error("useScrollContext must be used inside a <ScrollProvider>");
  }
  return ctx;
}
