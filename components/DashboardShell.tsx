import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ReactNode, useState } from "react";

import Button from "@/components/Button";
import Card from "@/components/Card";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { StatusBar } from "expo-status-bar";
import { showDecision } from "@/utils/alert";
import { useApp } from "@/context/AppContext";
import { useEvent } from "@/context/EventContext";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter();
  const { state, resetApp } = useApp();
  const { activeEvent, leaveCurrentEvent } = useEvent();
  const { t } = useLocalization();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const app = useApp();
  const maxName = state.guest?.name.split(" ").slice(0, 2).join(" ") ?? "";
  const name = maxName.length > 20 ? "" : maxName;
  const isCompleted = !!state.guest?.gotGiftAt;

  const handleReset = () => {
    showDecision({
      title: t("common.resetConfirmTitle"),
      message: t("common.resetConfirmMessage"),
      confirmText: t("common.ok"),
      cancelText: t("common.cancel"),
      onConfirm: async () => {
        setSettingsVisible(false);
        await resetApp();
        router.replace("/");
      },
    });
  };

  const handleLeaveEvent = () => {
    showDecision({
      title: t("common.leaveEvent"),
      message: t("common.leaveEventDescription"),
      confirmText: t("common.no"),
      cancelText: t("common.yes"),
      onConfirm: async () => {
        setSettingsVisible(false);
        await leaveCurrentEvent();
        router.replace("/");
      },
      onCancel: async () => {
        setSettingsVisible(false);
        await app.removeEvent(activeEvent?.code ?? "");
        await leaveCurrentEvent(true);
        router.replace("/");
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={[styles.text, styles.greeting]}>
              {name
                ? t("dashboard.greetingWithName", { name })
                : t("dashboard.greeting")}
            </Text>

            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setSettingsVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.settingsButtonText}>⚙</Text>
            </TouchableOpacity>
          </View>

          {state.guest?.role === "organizer" && activeEvent && (
            <>
              <Text style={styles.eventLabel}>
                EventName: {activeEvent.name}
              </Text>
              <Text style={styles.eventLabel}>
                Date:{" "}
                {activeEvent.date
                  ? ` · ${new Date(activeEvent.date).toLocaleDateString()}`
                  : ""}
              </Text>
              <Text style={styles.eventLabel}>
                Code: {activeEvent.code ? ` · ${activeEvent.code}` : ""}
              </Text>
            </>
          )}

          {state.guest?.role !== "organizer" && (
            <>
              <Text style={[styles.text, styles.subtitle]}>
                {isCompleted
                  ? t("dashboard.completedSubtitle1")
                  : t("dashboard.subtitle1")}
              </Text>
              <Text style={[styles.text, styles.subtitle]}>
                {isCompleted
                  ? t("dashboard.completedSubtitle2")
                  : t("dashboard.subtitle2")}
              </Text>
            </>
          )}
        </Card>

        {children}
      </ScrollView>

      <Modal
        visible={settingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.settingsModalCard}>
            <Text style={styles.settingsModalTitle}>
              {t("dashboard.settings")}
            </Text>
            <Text style={styles.settingsModalLabel}>{t("lang.switcher")}</Text>
            <LanguageSwitcher floating={false} />

            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "https://robertdani89.github.io/robi-zsani-wedding/",
                )
              }
              activeOpacity={0.7}
            >
              <Text style={styles.privacyPolicyLink}>
                {t("identify.privacyPolicy")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleLeaveEvent}
              activeOpacity={0.7}
            >
              <Text style={styles.resetButtonTitle}>
                {t("common.leaveEvent")}
              </Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Text style={styles.resetButtonTitle}>{t("common.reset")}</Text>
              <Text style={styles.resetButtonDescription}>
                {t("common.resetDescription")}
              </Text>
            </TouchableOpacity> */}

            <View style={styles.settingsActions}>
              <Button
                title={t("common.done")}
                onPress={() => setSettingsVisible(false)}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "GreatVibes",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 30,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#D4526E",
    marginBottom: 5,
    flex: 1,
  },
  subtitle: {
    fontSize: 20,
    color: "#7D5260",
  },
  settingsButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D9C4A0",
    marginLeft: 5,
  },
  settingsButtonText: {
    fontSize: 18,
    color: "#7D5260",
  },
  eventLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  settingsModalCard: {
    alignSelf: "stretch",
  },
  settingsModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  settingsModalLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  settingsActions: {
    marginTop: 20,
  },
  privacyPolicyLink: {
    fontSize: 14,
    color: "#000",
    marginTop: 10,
    marginBottom: 10,
    textDecorationLine: "underline",
  },
  resetButton: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#FFF5F7",
    borderWidth: 1,
    borderColor: "#F0C9D3",
  },
  resetButtonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#D4526E",
    marginBottom: 4,
  },
  resetButtonDescription: {
    fontSize: 14,
    color: "#666",
  },
});
