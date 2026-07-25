import React from "react";
import { Text, StyleSheet } from "react-native";
import ScreenScrollView from "../components/ui/ScreenScrollView.jsx";

export default function Browse() {
  return (
    <ScreenScrollView contentContainerStyle={styles.content}>
      <Text style={styles.text}>Browse</Text>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  text: { fontSize: 20 },
});
