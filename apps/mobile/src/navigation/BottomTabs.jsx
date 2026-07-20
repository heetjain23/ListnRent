import React from "react";
import { House, Search, ShoppingCart, User } from 'lucide-react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screens/Home.jsx";
import Browse from "../screens/Browse.jsx";
import Cart from "../screens/Cart.jsx";
import Account from "../screens/Account.jsx";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let Icon = null;
          if (route.name === 'Home') Icon = House;
          else if (route.name === 'Browse') Icon = Search;
          else if (route.name === 'Cart') Icon = ShoppingCart;
          else if (route.name === 'Profile') Icon = User;
          return Icon ? <Icon color={color} size={size} /> : null;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Browse" component={Browse} />
      <Tab.Screen name="Cart" component={Cart} />
      <Tab.Screen name="Profile" component={Account} />
    </Tab.Navigator>
  );
}
