import { COUPLE_NAMES, WEDDING_DATE } from "@/constants";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/identify");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.coupleNames}>{COUPLE_NAMES}</Text>

        <View style={styles.heartContainer}>
          <Text style={styles.heart}>💕</Text>
        </View>

        <Text style={styles.weddingDate}>{WEDDING_DATE}</Text>

        <View style={styles.messageContainer}>
          <Text style={styles.message}>
            Segíts nekünk szép emlékeket teremteni, és nyerj egy kis ajándékot!
          </Text>
          <Text style={styles.subMessage}>
            Válaszolj néhány apró kérdésre, ossz meg fotókat, és légy részese
            különleges napunknak!
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Kezdjük!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  coupleNames: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#D4526E",
    marginBottom: 20,
    textAlign: "center",
  },
  heartContainer: {
    marginVertical: 20,
  },
  heart: {
    fontSize: 64,
  },
  weddingDate: {
    fontSize: 20,
    color: "#7D5260",
    marginTop: 10,
    fontWeight: "500",
  },
  messageContainer: {
    marginTop: 40,
    marginBottom: 50,
  },
  message: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "600",
  },
  subMessage: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 15,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#D4526E",
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
