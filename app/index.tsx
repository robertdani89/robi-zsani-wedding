import { COUPLE_NAMES, WEDDING_DATE } from "@/constants";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Card from "@/components/Card";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    GreatVibes: require("@/assets/GreatVibes-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleGetStarted = () => {
    router.push("/identify");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Card>
          <Text style={[styles.text, styles.coupleNames]}>{COUPLE_NAMES}</Text>
        </Card>

        <View style={styles.heartContainer}>
          <Text style={[styles.text, styles.heart]}>💕</Text>
        </View>

        <Card style={styles.weddingDate}>
          <Text style={[styles.text, styles.weddingDateText]}>
            {WEDDING_DATE}
          </Text>
        </Card>

        <View style={styles.messageContainer}>
          <Card>
            <Text style={[styles.text, styles.message]}>
              Segíts nekünk szép emlékeket teremteni, és nyerj egy kis
              ajándékot!
            </Text>
          </Card>

          <Card style={styles.subMessageContainer}>
            <Text style={[styles.text, styles.subMessage]}>
              Válaszolj néhány apró kérdésre, ossz meg fotókat, és légy részese
              különleges napunknak!
            </Text>
          </Card>
        </View>

        <TouchableOpacity onPress={handleGetStarted} activeOpacity={0.8}>
          <Card>
            <Text style={[styles.text, styles.buttonText]}>Kezdjük!</Text>
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
  text: {
    fontFamily: "GreatVibes",
  },
  coupleNames: {
    fontSize: 36,
    color: "#D4526E",
    marginBottom: 0,
    textAlign: "center",
  },
  heartContainer: {
    marginVertical: 20,
  },
  heart: {
    fontSize: 36,
  },
  weddingDate: {
    marginTop: 10,
  },
  weddingDateText: {
    fontSize: 24,
    textAlign: "center",
  },
  messageContainer: {
    marginTop: 40,
    marginBottom: 50,
  },
  message: {
    fontSize: 24,
    color: "#333",
    textAlign: "center",
    lineHeight: 32,
  },
  subMessageContainer: {
    marginTop: 15,
  },
  subMessage: {
    fontSize: 24,
    color: "#333",
    textAlign: "center",
    lineHeight: 32,
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
    fontSize: 24,
    textAlign: "center",
  },
});
