import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext.jsx";
import BottomTabs from "./BottomTabs.jsx";
import Login from "../screens/Login.jsx";
import ConnectionTest from "../screens/ConnectionTest.jsx";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ConnectionTest" component={ConnectionTest} />
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={BottomTabs} />
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}