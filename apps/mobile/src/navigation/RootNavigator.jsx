import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./BottomTabs.jsx";
import Login from "../screens/Login.jsx";
import ConnectionTest from "../screens/ConnectionTest.jsx";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="ConnectionTest" component={ConnectionTest} />
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}