import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext.jsx";
import { SocketProvider } from "./src/context/SocketContext.jsx";
import RootNavigator from "./src/navigation/RootNavigator.jsx";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SocketProvider>
          <RootNavigator />
        </SocketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
