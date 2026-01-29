import { COUPLE_NAMES, WEDDING_DATE } from "@/constants";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Card from "@/components/Card";
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
        <Card>
          <Text style={styles.coupleNames}>{COUPLE_NAMES}</Text>
        </Card>

        <View style={styles.heartContainer}>
          <Text style={styles.heart}>💕</Text>
        </View>

        <Card style={styles.weddingDate}>
          <Text>{WEDDING_DATE}</Text>
        </Card>

        <View style={styles.messageContainer}>
          <Card>
            <Text style={styles.message}>
              Segíts nekünk szép emlékeket teremteni, és nyerj egy kis
              ajándékot!
            </Text>
          </Card>

          <Card style={styles.subMessage}>
            <Text>
              Válaszolj néhány apró kérdésre, ossz meg fotókat, és légy részese
              különleges napunknak!
            </Text>
          </Card>
        </View>

        <TouchableOpacity onPress={handleGetStarted} activeOpacity={0.8}>
          <Card>
            <Text style={styles.buttonText}>Kezdjük!</Text>
          </Card>
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
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
});
