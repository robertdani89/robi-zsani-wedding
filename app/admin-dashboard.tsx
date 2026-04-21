import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Card from "@/components/Card";
import DashboardShell from "@/components/DashboardShell";
import { useApp } from "@/context/AppContext";
import { useEffect } from "react";
import { useEvent } from "@/context/EventContext";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { t } = useLocalization();
  const { state } = useApp();
  const { activeEvent } = useEvent();

  useEffect(() => {
    const resolvedRole = state.guest?.role ?? activeEvent?.role ?? "guest";

    if (resolvedRole !== "organizer") {
      router.replace("/dashboard");
    }
  }, [activeEvent?.role, router, state.guest?.role]);

  return (
    <DashboardShell>
      <Card style={styles.toolsContainer}>
        <Text style={styles.sectionTitle}>{t("dashboard.organizerTools")}</Text>

        <TouchableOpacity
          style={styles.toolCard}
          onPress={() => router.push("/edit-template")}
          activeOpacity={0.7}
        >
          <View style={styles.toolIcon}>
            <Text style={styles.toolEmoji}>📝</Text>
          </View>
          <View style={styles.toolContent}>
            <Text style={styles.toolTitle}>{t("dashboard.editTemplate")}</Text>
            <Text style={styles.toolDescription}>
              {t("dashboard.editTemplateDesc")}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolCard}
          onPress={() => router.push("/admin")}
          activeOpacity={0.7}
        >
          <View style={styles.toolIcon}>
            <Text style={styles.toolEmoji}>🔐</Text>
          </View>
          <View style={styles.toolContent}>
            <Text style={styles.toolTitle}>{t("dashboard.adminPanel")}</Text>
            <Text style={styles.toolDescription}>
              {t("dashboard.adminPanelDesc")}
            </Text>
          </View>
        </TouchableOpacity>

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
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  toolsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
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
});
