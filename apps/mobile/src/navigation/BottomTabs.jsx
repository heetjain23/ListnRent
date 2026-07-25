import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screens/Home.jsx";
import Browse from "../screens/Browse.jsx";
import Cart from "../screens/Cart.jsx";
import Account from "../screens/Account.jsx";
import BottomNavbar from "../components/ui/BottomNavbar.jsx";
import { ScrollProvider } from "../context/ScrollContext.jsx";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    // ScrollProvider makes one scroll position available to every screen's
    // TopNavbar and to BottomNavbar below - single source of truth.
    <ScrollProvider>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <BottomNavbar {...props} />}
      >
        <Tab.Screen name="Home" component={Home} options={{ title: "Home" }} />
        <Tab.Screen name="Browse" component={Browse} options={{ title: "Browse" }} />
        <Tab.Screen name="Cart" component={Cart} options={{ title: "Cart" }} />
        <Tab.Screen name="Profile" component={Account} options={{ title: "Profile" }} />
      </Tab.Navigator>
    </ScrollProvider>
  );
}
