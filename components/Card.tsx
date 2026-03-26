import { StyleSheet, View, ViewStyle } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  return (
    <View style={[styles.outerBorder, style]}>
      <View style={styles.innerBorder}>
        <LinearGradient
          colors={["#F5E6D3", "#E8D4B8", "#D9C4A0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>{children}</View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerBorder: {
    backgroundColor: "#8B4513",
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  innerBorder: {
    backgroundColor: "#A0522D",
    padding: 4,
    borderRadius: 8,
  },
  gradient: {
    borderRadius: 6,
    overflow: "hidden",
  },
  content: {
    padding: 20,
  },
});
