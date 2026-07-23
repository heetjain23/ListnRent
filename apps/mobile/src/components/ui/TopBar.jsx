import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function TopBar() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        Listn<Text style={styles.logoAccent}>Rent</Text>
      </Text>

      <Pressable onPress={ () => navigation.navigate('Login')} style={styles.signInPill}>
        <Text style={styles.signInText}>Sign In</Text>
      </Pressable>  
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 28,
    gap: 70,
  },
  logo: {
    fontSize: 30,
    fontWeight: "900",
    color: "#1A1A1A",
  },
  logoAccent: { color: "#00342B" },
  signInPill: {
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.4)",
    backgroundColor: "rgba(212,175,55,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  signInText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#8B7340",
    textTransform: "uppercase",
  },
});