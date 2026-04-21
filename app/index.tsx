import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { Guest } from "@/types";
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

export default function OnboardingScreen() {
  const router = useRouter();
  const { state, isHydrated, setGuest, setAssignedQuestions } = useApp();
  const {
    activeEvent,
    events,
    isHydrated: eventsHydrated,
    updateEvent,
  } = useEvent();
  const { t } = useLocalization();
  const [fontsLoaded] = useFonts({
    GreatVibes: require("@/assets/GreatVibes-Regular.ttf"),
  });

  useEffect(() => {
    if (!isHydrated || !eventsHydrated) {
      return;
    }

    // If there's an active event and guest is registered, go to dashboard
    if (activeEvent && state.guest) {
      router.replace("/dashboard");
      return;
    }
    // If organizer has a name stored, auto-register and skip identify
    if (
      activeEvent &&
      !state.guest &&
      activeEvent.role === "organizer" &&
      activeEvent.organizerName
    ) {
      (async () => {
        try {
          const { guest: serverGuest, questions } =
            await apiService.registerGuest(
              activeEvent.organizerName!,
              activeEvent.code,
              "organizer",
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
          if (serverGuest.role && activeEvent.role !== serverGuest.role) {
            await updateEvent({ ...activeEvent, role: serverGuest.role });
          }
          router.replace("/dashboard");
        } catch {
          router.replace("/identify");
        }
      })();
      return;
    }
    // If there's an active event but no guest, go to identify
    if (activeEvent && !state.guest) {
      router.replace("/identify");
    }
  }, [isHydrated, eventsHydrated, router, state.guest, activeEvent]);

  if (!fontsLoaded || !isHydrated || !eventsHydrated) {
    return null;
  }

  return (
    <ScrollView>
      <LanguageSwitcher />
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.content}>
          <Card>
            <Text style={[styles.text, styles.appTitle]}>
              {t("onboarding.appName")}
            </Text>
            <Text style={[styles.text, styles.appSubtitle]}>
              {t("onboarding.tagline")}
            </Text>
          </Card>

          <View style={styles.messageContainer}>
            <Card>
              <Text style={[styles.text, styles.message]}>
                {t("onboarding.description")}
              </Text>
            </Card>
          </View>

          <View style={styles.buttonGroup}>
            <Button
              title={t("onboarding.createEvent")}
              onPress={() => router.push("/create-event")}
            />
            <View style={styles.buttonSpacer} />
            <Button
              title={t("onboarding.joinEvent")}
              onPress={() => router.push("/join-event")}
            />
          </View>

          {events.length > 0 && (
            <Card style={styles.eventsListContainer}>
              <Text style={styles.eventsListTitle}>
                {t("onboarding.yourEvents")}
              </Text>
              {events.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventItem}
                  onPress={() => {
                    router.push({
                      pathname: "/join-event",
                      params: { code: event.code, rejoin: "1" },
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.eventItemContent}>
                    <Text style={styles.eventItemName}>{event.name}</Text>
                    <Text style={styles.eventItemMeta}>
                      {event.role === "organizer"
                        ? t("onboarding.roleOrganizer")
                        : event.role === "assistant"
                          ? t("onboarding.roleAssistant")
                          : t("onboarding.roleGuest")}{" "}
                      · {event.code}
                    </Text>
                  </View>
                  <Text style={styles.eventItemArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </Card>
          )}
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  text: {
    fontFamily: "GreatVibes",
  },
  appTitle: {
    fontSize: 34,
    color: "#D4526E",
    textAlign: "center",
  },
  appSubtitle: {
    fontSize: 20,
    color: "#7D5260",
    textAlign: "center",
    marginTop: 4,
  },
  messageContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
  message: {
    fontSize: 22,
    color: "#333",
    textAlign: "center",
    lineHeight: 30,
  },
  buttonGroup: {
    width: "100%",
    marginBottom: 30,
  },
  buttonSpacer: {
    height: 15,
  },
  eventsListContainer: {
    width: "100%",
    marginTop: 10,
  },
  eventsListTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  eventItemContent: {
    flex: 1,
  },
  eventItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  eventItemMeta: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
  eventItemArrow: {
    fontSize: 20,
    color: "#D4526E",
    marginLeft: 10,
  },
});
