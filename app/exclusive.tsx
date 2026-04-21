import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import Button from "@/components/Button";
import Card from "@/components/Card";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { StatusBar } from "expo-status-bar";
import apiService from "@/services/api";
import { useApp } from "@/context/AppContext";
import { useEffect } from "react";
import { useEvent } from "@/context/EventContext";
import { useFonts } from "expo-font";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";

apiService; // initialize API service to set up base URL and interceptors

export default function WelcomeScreen() {
  const router = useRouter();
  const { state, isHydrated } = useApp();
  const { t } = useLocalization();
  const { joinEvent } = useEvent();
  const [fontsLoaded] = useFonts({
    GreatVibes: require("@/assets/GreatVibes-Regular.ttf"),
  });

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (state.guest) {
      router.replace("/dashboard");
    }
  }, [isHydrated, router, state.guest]);

  if (!fontsLoaded || !isHydrated) {
    return null;
  }

  const handleGetStarted = async () => {
    await joinEvent("XXLRMS");
    router.replace("/identify");
  };

  return (
    <ScrollView>
      <LanguageSwitcher />
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.content}>
          <Card>
            <Text style={[styles.text, styles.coupleNames]}>Zsani & Robi</Text>
            <Text style={[styles.text, styles.weddingDateText]}>
              2026 Május 2.
            </Text>
          </Card>

          <View style={[styles.coupleImagesContainer]}>
            <Image source={require("../assets/zsani.png")} resizeMode="cover" />
            <View style={styles.heartContainer}>
              <Text style={[styles.text, styles.heart]}>💕</Text>
            </View>
            <Image source={require("../assets/robi.png")} resizeMode="cover" />
          </View>

          <View style={styles.messageContainer}>
            <Card>
              <Text style={[styles.text, styles.message]}>
                {t("welcome.message")}
              </Text>
            </Card>

            <Card style={styles.subMessageContainer}>
              <Text style={[styles.text, styles.subMessage]}>
                {t("welcome.subMessage")}
              </Text>
            </Card>
          </View>

          <Button title={t("welcome.start")} onPress={handleGetStarted} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    marginTop: 50,
    marginBottom: 50,
  },
  coupleImagesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
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
  weddingDateText: {
    fontSize: 24,
    textAlign: "center",
  },
  messageContainer: {
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
