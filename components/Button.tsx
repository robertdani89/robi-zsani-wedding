import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import React from "react";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.shadowWrapper,
        pressed && !disabled && styles.shadowWrapperPressed,
        style,
      ]}
    >
      {({ pressed }) => (
        <LinearGradient
          colors={
            disabled
              ? ["#9E9189", "#7A706A", "#5E5550"]
              : pressed
                ? ["#6B3410", "#8B4513", "#7A3C11"]
                : ["#A0522D", "#8B4513", "#6B3410"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.body}
        >
          {/* top-edge highlight to give a raised/3-D feel */}
          <View style={styles.highlight} />
          <Text
            style={[
              styles.label,
              disabled && styles.disabledLabel,
              pressed && !disabled && styles.pressedLabel,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: 10,
    shadowColor: "#3B1A08",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 8,
  },
  shadowWrapperPressed: {
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    transform: [{ translateY: 3 }],
  },
  body: {
    borderRadius: 10,
    overflow: "hidden",
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#5C2E0E",
  },
  highlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  label: {
    color: "#FDF3E7",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pressedLabel: {
    color: "#F0D8BC",
  },
  disabledLabel: {
    color: "#C0B4AA",
  },
});
