import { Platform, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";

import Card from "@/components/Card";
import DashboardShell from "@/components/DashboardShell";
import type { ErrorLogEntry, GiftType } from "@/types";
import apiService from "@/services/api";
import { useApp } from "@/context/AppContext";
import { useEffect, useRef, useState } from "react";
import { useEvent } from "@/context/EventContext";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";
import { showMessage } from "@/utils/alert";

const ERROR_POLL_MS = 3500;
const ALERT_SOUND_URI =
  "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";

export default function AssistantDashboardScreen() {
  const router = useRouter();
  const { t } = useLocalization();
  const { state } = useApp();
  const { activeEvent } = useEvent();
  const [isSendingGift, setIsSendingGift] = useState(false);
  const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>([]);
  const [isLoadingErrors, setIsLoadingErrors] = useState(true);
  const lastKnownErrorRef = useRef<string | null>(null);
  const didInitializeErrorsRef = useRef(false);

  useEffect(() => {
    const resolvedRole = state.guest?.role ?? activeEvent?.role ?? "guest";

    if (resolvedRole !== "assistant") {
      router.replace("/dashboard");
    }
  }, [activeEvent?.role, router, state.guest?.role]);

  const playErrorAlert = async () => {
    Vibration.vibrate(350);

    if (Platform.OS === "web") {
      try {
        const audio = new Audio(ALERT_SOUND_URI);
        await audio.play();
      } catch (error) {
        console.warn("Could not play alert sound", error);
      }
      return;
    }

    try {
      const { Audio } = await import("expo-av");
      const { sound } = await Audio.Sound.createAsync(
        { uri: ALERT_SOUND_URI },
        { shouldPlay: true, volume: 1 },
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          void sound.unloadAsync();
        }
      });
    } catch (error) {
      console.warn("Could not play mobile alert sound", error);
    }
  };

  useEffect(() => {
    let isDisposed = false;

    const fetchErrors = async () => {
      try {
        const logs = await apiService.getErrorLogs();
        if (isDisposed) {
          return;
        }

        const sortedLogs = [...logs].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
        setErrorLogs(sortedLogs);

        const latestError = sortedLogs.find((entry) => entry.type === "error");
        const latestErrorKey = latestError
          ? `${latestError.timestamp}::${latestError.message}`
          : null;

        if (!didInitializeErrorsRef.current) {
          didInitializeErrorsRef.current = true;
          lastKnownErrorRef.current = latestErrorKey;
        } else if (
          latestErrorKey &&
          latestErrorKey !== lastKnownErrorRef.current
        ) {
          lastKnownErrorRef.current = latestErrorKey;
          await playErrorAlert();
        }
      } catch (error) {
        if (!isDisposed) {
          console.warn("Error log polling failed", error);
        }
      } finally {
        if (!isDisposed) {
          setIsLoadingErrors(false);
        }
      }
    };

    void fetchErrors();
    const intervalId = setInterval(() => {
      void fetchErrors();
    }, ERROR_POLL_MS);

    return () => {
      isDisposed = true;
      clearInterval(intervalId);
    };
  }, []);

  const handleManualGift = async (giftType: GiftType) => {
    if (isSendingGift) {
      return;
    }

    setIsSendingGift(true);

    try {
      const result = await apiService.openManualGift(giftType);

      if (result.status !== "ok") {
        showMessage(
          t("dashboard.giftRequestErrorTitle"),
          result.message || t("dashboard.giftRequestErrorMessage"),
        );
        return;
      }

      showMessage(
        t("dashboard.giftRequestSuccessTitle"),
        t("dashboard.giftRequestSuccessMessage"),
      );
    } catch (error) {
      console.error("Manual gift request error:", error);
      showMessage(
        t("dashboard.giftRequestErrorTitle"),
        t("dashboard.giftRequestErrorMessage"),
      );
    } finally {
      setIsSendingGift(false);
    }
  };

  return (
    <DashboardShell>
      <Card style={styles.giftContainer}>
        <Text style={styles.sectionTitle}>{t("dashboard.giftRequests")}</Text>

        <View style={styles.giftButtonsRow}>
          <TouchableOpacity
            style={[styles.giftButton, isSendingGift && styles.disabledButton]}
            onPress={() => void handleManualGift("gift_for_man")}
            activeOpacity={0.7}
            disabled={isSendingGift}
          >
            <Text style={styles.giftButtonText}>{t("dashboard.giftMan")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.giftButton, isSendingGift && styles.disabledButton]}
            onPress={() => void handleManualGift("gift_for_ladies")}
            activeOpacity={0.7}
            disabled={isSendingGift}
          >
            <Text style={styles.giftButtonText}>{t("dashboard.giftWoman")}</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.toolsContainer}>
        <Text style={styles.sectionTitle}>{t("dashboard.songAssist")}</Text>

        <TouchableOpacity
          style={styles.toolCard}
          onPress={() => router.push("/assist")}
          activeOpacity={0.7}
        >
          <View style={styles.toolIcon}>
            <Text style={styles.toolEmoji}>🎵</Text>
          </View>
          <View style={styles.toolContent}>
            <Text style={styles.toolTitle}>{t("dashboard.songAssist")}</Text>
            <Text style={styles.toolDescription}>
              {t("dashboard.songAssistDesc")}
            </Text>
          </View>
        </TouchableOpacity>
      </Card>

      <Card style={styles.errorContainer}>
        <Text style={styles.sectionTitle}>{t("dashboard.errorLogs")}</Text>

        {isLoadingErrors ? (
          <Text style={styles.errorHint}>{t("dashboard.errorLogsLoading")}</Text>
        ) : errorLogs.length === 0 ? (
          <Text style={styles.errorHint}>{t("dashboard.errorLogsEmpty")}</Text>
        ) : (
          errorLogs.slice(0, 8).map((entry, index) => (
            <View key={`${entry.timestamp}-${index}`} style={styles.logRow}>
              <Text style={styles.logType}>
                {entry.type === "error" ? "ERROR" : "INFO"}
              </Text>
              <View style={styles.logContent}>
                <Text style={styles.logMessage}>{entry.message}</Text>
                <Text style={styles.logTimestamp}>
                  {new Date(entry.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </Card>

    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  giftContainer: {
    marginBottom: 20,
  },
  toolsContainer: {
    marginBottom: 20,
  },
  errorContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  giftButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  giftButton: {
    flex: 1,
    backgroundColor: "#F3C7D3",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  giftButtonText: {
    color: "#5C2334",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  toolCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 10,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  toolIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF5F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  toolEmoji: {
    fontSize: 24,
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 14,
    color: "#666",
  },
  errorHint: {
    fontSize: 14,
    color: "#666",
  },
  logRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F2E6EA",
  },
  logType: {
    width: 52,
    fontSize: 12,
    fontWeight: "700",
    color: "#8A3350",
    marginTop: 2,
  },
  logContent: {
    flex: 1,
  },
  logMessage: {
    fontSize: 14,
    color: "#333",
  },
  logTimestamp: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
});
