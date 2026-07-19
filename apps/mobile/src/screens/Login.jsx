import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

/**
 * Placeholder. NOTE: web's login (signInWithPopup) is browser-only and will
 * NOT work here. Native Google Sign-In needs a separate flow — either
 * expo-auth-session (Expo Go-compatible) or @react-native-google-signin
 * (needs a custom dev client / EAS build, not Expo Go). We'll wire the real
 * one when we build this screen for real — flagging it now so it's not a
 * surprise later.
 */
export default function Login() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <Pressable style={styles.button} disabled>
        <Text style={styles.buttonText}>Continue with Google (not wired yet)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  title: { fontSize: 22, fontWeight: "700" },
  button: { padding: 14, borderRadius: 8, backgroundColor: "#ddd" },
  buttonText: { color: "#666" },
});
