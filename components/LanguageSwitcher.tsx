import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useLocalization } from "@/context/LocalizationContext";

interface LanguageSwitcherProps {
  floating?: boolean;
}

export default function LanguageSwitcher({
  floating = true,
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocalization();

  return (
    <View style={[styles.wrapper, !floating && styles.wrapperInline]}>
      <TouchableOpacity
        style={[styles.button, locale === "hu" && styles.buttonActive]}
        onPress={() => setLocale("hu")}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.buttonText,
            locale === "hu" && styles.buttonTextActive,
          ]}
        >
          HU
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, locale === "en" && styles.buttonActive]}
        onPress={() => setLocale("en")}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.buttonText,
            locale === "en" && styles.buttonTextActive,
          ]}
        >
          EN
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 30,
    right: 16,
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    padding: 4,
    zIndex: 50,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  wrapperInline: {
    position: "relative",
    top: 0,
    right: 0,
    alignSelf: "flex-start",
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  buttonActive: {
    backgroundColor: "#D4526E",
  },
  buttonText: {
    fontSize: 12,
    color: "#7D5260",
    fontWeight: "700",
  },
  buttonTextActive: {
    color: "#FFF",
  },
});
