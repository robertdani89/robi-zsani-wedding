import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { Guest } from "@/types";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { StatusBar } from "expo-status-bar";
import apiService from "@/services/api";
import { showMessage } from "@/utils/alert";
import { useApp } from "@/context/AppContext";
import { useEvent } from "@/context/EventContext";
import { useFonts } from "expo-font";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";

export default function IdentifyScreen() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { t } = useLocalization();
  const { state, setGuest, setAssignedQuestions } = useApp();
  const { activeEvent, updateEvent } = useEvent();
  const [fontsLoaded] = useFonts({
    GreatVibes: require("@/assets/GreatVibes-Regular.ttf"),
  });

  useEffect(() => {
    if (activeEvent && state.guest) {
      router.replace("/dashboard");
    }
  }, [activeEvent, state.guest]);

  if (!fontsLoaded) {
    return null;
  }

  const handleContinue = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      showMessage(
        t("identify.nameRequiredTitle"),
        t("identify.nameRequiredMessage"),
      );
      return;
    }

    if (!activeEvent?.code) {
      showMessage(
        t("identify.connectionErrorTitle"),
        t("joinEvent.errorMessage"),
      );
      return;
    }

    setIsLoading(true);

    try {
      // Register guest on server and get assigned questions
      const { guest: serverGuest, questions } = await apiService.registerGuest(
        trimmedName,
        activeEvent.code,
      );

      const newGuest: Guest = {
        id: serverGuest.id,
        name: serverGuest.name,
        role: serverGuest.role,
        completed: false,
        createdAt: serverGuest.createdAt,
      };

      await setGuest(newGuest);
      await setAssignedQuestions(activeEvent.questions ?? questions);

      if (
        activeEvent &&
        serverGuest.role &&
        activeEvent.role !== serverGuest.role
      ) {
        await updateEvent({ ...activeEvent, role: serverGuest.role });
      }

      router.replace("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      showMessage(
        t("identify.connectionErrorTitle"),
        t("identify.connectionErrorMessage"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container]}
    >
      <ScrollView>
        <StatusBar style="dark" />
        <LanguageSwitcher />

        <View style={styles.content}>
          <Card>
            <Text style={[styles.text, styles.title]}>
              {t("identify.title")}
            </Text>
            <Text style={[styles.text, styles.subtitle]}>
              {t("identify.subtitle")}
            </Text>
          </Card>

          <Card style={styles.inputContainer}>
            <Text style={[styles.text, styles.label]}>
              {t("identify.nameLabel")}
            </Text>
            <TextInput
              style={[styles.input]}
              placeholder={t("identify.namePlaceholder")}
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              editable={!isLoading}
            />
            <Text style={[styles.text, styles.hint]}>{t("identify.hint")}</Text>
          </Card>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                "https://robertdani89.github.io/robi-zsani-wedding/",
              )
            }
            activeOpacity={0.7}
          >
            <Text style={[styles.privacyPolicyLink]}>
              {t("identify.privacyPolicy")}
            </Text>
          </TouchableOpacity>

          <Button
            title={t("welcome.start")}
            onPress={handleContinue}
            disabled={!name.trim() || name.trim().length < 3 || isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "GreatVibes",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
    marginTop: 50,
    marginBottom: 50,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    color: "#D4526E",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#7D5260",
  },
  inputContainer: {
    marginTop: 40,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#FFD1DC",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
  },
  hint: {
    fontSize: 13,
    color: "#444",
    marginTop: 8,
  },
  privacyPolicyLink: {
    fontSize: 14,
    color: "#000",
    marginBottom: 10,
    textDecorationLine: "underline",
  },
});
