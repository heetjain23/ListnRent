import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screens/Home.jsx";

// Mirrors apps/web/client/src/components/layout/BottomNav.jsx tabs:
// Home, Browse, Cart, Profile (+ a center "create listing" action on web).
// Only Home is wired for now — the rest are placeholders using Home's
// component until we build Collection/Cart/Dashboard screens for real.
const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Browse" component={Home} />
      <Tab.Screen name="Cart" component={Home} />
      <Tab.Screen name="Profile" component={Home} />
    </Tab.Navigator>
  );
}
