import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
import { useState } from "react";

export default function CreateEventScreen() {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDateObj, setEventDateObj] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }
    if (date) {
      setEventDateObj(date);
      setEventDate(date.toISOString().split("T")[0]);
    }
  };

  const handleCreate = async () => {
    const trimmedName = eventName.trim();

    if (!trimmedName) {
      showMessage(
        t("createEvent.requiredTitle"),
        t("createEvent.nameRequired"),
      );
      return;
    }

    if (!eventDate.trim()) {
      showMessage(
        t("createEvent.requiredTitle"),
        t("createEvent.dateRequired"),
      );
      return;
    }

    if (!organizerName.trim()) {
      showMessage(
        t("createEvent.requiredTitle"),
        t("createEvent.organizerRequired"),
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
          await setAssignedQuestions(event.questions ?? questions);
          if (serverGuest.role && event.role !== serverGuest.role) {
            await updateEvent({ ...event, role: serverGuest.role });
          }
        } catch {
          // Registration failed – they'll land on identify instead
        }
      }

      showMessage(
        t("createEvent.successTitle"),
        t("createEvent.successMessage", { code: event.code }),
        () => router.replace("/dashboard"),
        t("common.done"),
      );
    } catch (error) {
      console.error("Create event error:", error);
      showMessage(t("createEvent.errorTitle"), t("createEvent.errorMessage"));
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
            {Platform.OS === "web" ? (
              <TextInput
                style={styles.input}
                placeholder={t("createEvent.eventDatePlaceholder")}
                placeholderTextColor="#999"
                value={eventDate}
                onChangeText={setEventDate}
                editable={!isLoading}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => !isLoading && setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={
                      eventDateObj
                        ? styles.datePickerText
                        : styles.datePickerPlaceholder
                    }
                  >
                    {eventDateObj
                      ? eventDate
                      : t("createEvent.eventDatePlaceholder")}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={eventDateObj ?? new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </>
            )}
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
              <TouchableOpacity style={styles.radioRow} activeOpacity={1}>
                <View style={styles.radioOuter}>
                  <View style={styles.radioInner} />
                </View>
                <View style={styles.radioTextContainer}>
                  <Text style={styles.templateName}>
                    {t("createEvent.weddingTemplate")}
                  </Text>
                  <Text style={styles.templateDescription}>
                    {t("createEvent.weddingTemplateDesc")}
                  </Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.moreComing}>
                {t("createEvent.moreComing")}
              </Text>
            </Card>
          </View>

          <View style={styles.actions}>
            <Button
              title={t("createEvent.create")}
              onPress={handleCreate}
              disabled={
                !eventName.trim() ||
                !eventDate.trim() ||
                !organizerName.trim() ||
                isLoading
              }
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
  datePickerButton: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#FFD1DC",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: "center" as const,
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
  },
  datePickerPlaceholder: {
    fontSize: 16,
    color: "#999",
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
  radioRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
    gap: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D4526E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D4526E",
  },
  radioTextContainer: {
    flex: 1,
  },
  moreComing: {
    fontSize: 13,
    color: "#AAA",
    fontStyle: "italic",
    marginTop: 14,
  },
  actions: {
    marginTop: 30,
  },
  spacer: {
    height: 12,
  },
});
