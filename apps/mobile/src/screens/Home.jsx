import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocketContext } from "../context/SocketContext.jsx";

// Placeholder — proves the wiring (auth + api + socket) works end to end
// before we build real screens off apps/web/client/src/pages/Home.jsx.
export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const { connectionStatus } = useSocketContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ListnRent</Text>
      <Text style={styles.line}>Auth loading: {String(loading)}</Text>
      <Text style={styles.line}>Signed in: {String(isAuthenticated)}</Text>
      <Text style={styles.line}>User: {user?.displayName || "none"}</Text>
      <Text style={styles.line}>Socket: {connectionStatus}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12 },
  line: { fontSize: 14, color: "#444" },
});
