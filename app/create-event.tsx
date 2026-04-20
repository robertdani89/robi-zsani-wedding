import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { Guest } from "@/types";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { StatusBar } from "expo-status-bar";
import apiService from "@/services/api";
import { useApp } from "@/context/AppContext";
import { useEvent } from "@/context/EventContext";
import { useFonts } from "expo-font";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function CreateEventScreen() {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { t } = useLocalization();
  const { createEvent, updateEvent } = useEvent();
  const { setGuest, setAssignedQuestions } = useApp();
  const [fontsLoaded] = useFonts({
    GreatVibes: require("@/assets/GreatVibes-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleCreate = async () => {
    const trimmedName = eventName.trim();

    if (!trimmedName) {
      Alert.alert(
        t("createEvent.requiredTitle"),
        t("createEvent.nameRequired"),
      );
      return;
    }

    setIsLoading(true);

    try {
      const orgName = organizerName.trim();
      const event = await createEvent(
        trimmedName,
        eventDate.trim(),
        orgName || undefined,
      );

      if (orgName) {
        try {
          const { guest: serverGuest, questions } =
            await apiService.registerGuest(orgName, event.code, "organizer");
          const newGuest: Guest = {
            id: serverGuest.id,
            name: serverGuest.name,
            role: serverGuest.role,
            completed: false,
            createdAt: serverGuest.createdAt,
          };
          await setGuest(newGuest);
          await setAssignedQuestions(questions);
          if (serverGuest.role && event.role !== serverGuest.role) {
            await updateEvent({ ...event, role: serverGuest.role });
          }
        } catch {
          // Registration failed – they'll land on identify instead
        }
      }

      Alert.alert(
        t("createEvent.successTitle"),
        t("createEvent.successMessage", { code: event.code }),
        [
          {
            text: t("common.done"),
            onPress: () => router.replace("/dashboard"),
          },
        ],
      );
    } catch (error) {
      console.error("Create event error:", error);
      Alert.alert(t("createEvent.errorTitle"), t("createEvent.errorMessage"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView>
        <StatusBar style="dark" />
        <LanguageSwitcher />

        <View style={styles.content}>
          <Card>
            <Text style={[styles.text, styles.title]}>
              {t("createEvent.title")}
            </Text>
            <Text style={[styles.text, styles.subtitle]}>
              {t("createEvent.subtitle")}
            </Text>
          </Card>

          <Card style={styles.inputContainer}>
            <Text style={styles.label}>{t("createEvent.eventName")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("createEvent.eventNamePlaceholder")}
              placeholderTextColor="#999"
              value={eventName}
              onChangeText={setEventName}
              autoFocus
              editable={!isLoading}
            />
          </Card>

          <Card style={styles.inputContainer}>
            <Text style={styles.label}>{t("createEvent.eventDate")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("createEvent.eventDatePlaceholder")}
              placeholderTextColor="#999"
              value={eventDate}
              onChangeText={setEventDate}
              editable={!isLoading}
            />
          </Card>

          <Card style={styles.inputContainer}>
            <Text style={styles.label}>{t("createEvent.organizerName")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("createEvent.organizerNamePlaceholder")}
              placeholderTextColor="#999"
              value={organizerName}
              onChangeText={setOrganizerName}
              editable={!isLoading}
            />
          </Card>

          <View style={styles.templateInfo}>
            <Card>
              <Text style={styles.templateLabel}>
                {t("createEvent.template")}
              </Text>
              <Text style={styles.templateName}>
                {t("createEvent.weddingTemplate")}
              </Text>
              <Text style={styles.templateDescription}>
                {t("createEvent.weddingTemplateDesc")}
              </Text>
            </Card>
          </View>

          <View style={styles.actions}>
            <Button
              title={t("createEvent.create")}
              onPress={handleCreate}
              disabled={!eventName.trim() || isLoading}
            />
            <View style={styles.spacer} />
            <Button title={t("common.back")} onPress={() => router.back()} />
          </View>
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
    fontSize: 30,
    color: "#D4526E",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#7D5260",
  },
  inputContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
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
  templateInfo: {
    marginTop: 20,
  },
  templateLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  templateName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  templateDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  actions: {
    marginTop: 30,
  },
  spacer: {
    height: 12,
  },
});
