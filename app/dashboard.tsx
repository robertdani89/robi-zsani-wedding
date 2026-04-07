import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import Button from "@/components/Button";
import Card from "@/components/Card";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { StatusBar } from "expo-status-bar";
import { useApp } from "@/context/AppContext";
import { useFonts } from "expo-font";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function DashboardScreen() {
  const router = useRouter();
  const { state, getTaskStatus } = useApp();
  const { t } = useLocalization();
  const taskStatus = getTaskStatus();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const [settingsVisible, setSettingsVisible] = useState(false);
  const latestSelectedSong =
    state.song.length > 0 ? state.song[state.song.length - 1] : null;
  const [fontsLoaded] = useFonts({
    GreatVibes: require("@/assets/GreatVibes-Regular.ttf"),
  });

  const isCompleted = !!state.guest?.gotGiftAt;

  const getStatusBadge = (completed: boolean, inProgress: boolean) => {
    if (completed) {
      return {
        text: t("status.completed"),
        color: "#4CAF50",
        bgColor: "#E8F5E9",
      };
    }
    if (inProgress) {
      return {
        text: t("status.inProgress"),
        color: "#FF9800",
        bgColor: "#FFF3E0",
      };
    }
    return {
      text: t("status.notStarted"),
      color: "#9E9E9E",
      bgColor: "#F5F5F5",
    };
  };

  const questionStatus = getStatusBadge(
    taskStatus.questionsCompleted,
    state.answers.length > 0 && !taskStatus.questionsCompleted,
  );

  const photoStatus = getStatusBadge(
    taskStatus.photosUploaded,
    state.photos.length > 0 && !taskStatus.photosUploaded,
  );

  const songStatus = getStatusBadge(taskStatus.songSelected, false);

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
              {t("dashboard.greeting", { name: state.guest?.name ?? "" })}
            </Text>

            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setSettingsVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.settingsButtonText}>⚙</Text>
            </TouchableOpacity>
          </View>

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
        </Card>

        {/* Progress Bar - Hidden when completed */}
        {!isCompleted && (
          <Card style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                {t("dashboard.progress")}
              </Text>
              <Text style={styles.progressPercentage}>
                {taskStatus.progressPercentage}%
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${taskStatus.progressPercentage}%` },
                ]}
              />
            </View>
          </Card>
        )}

        {/* Task Cards - Hidden when completed */}
        {!isCompleted && (
          <Card style={styles.tasksContainer}>
            <Text style={styles.sectionTitle}>{t("dashboard.tasks")}</Text>
            {/* Questions Card */}
            <TouchableOpacity
              style={[styles.taskCard, isSmallScreen && styles.taskCardSmall]}
              onPress={() => router.push("/questions")}
              activeOpacity={0.7}
            >
              <View
                style={[styles.taskInfo, isSmallScreen && styles.taskInfoSmall]}
              >
                <View style={styles.taskIcon}>
                  <Text style={styles.taskEmoji}>❓</Text>
                </View>
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>
                    {t("dashboard.questions")}
                  </Text>
                  <Text style={styles.taskDescription}>
                    {t("dashboard.questionsProgress", {
                      count: state.answers.length,
                    })}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: questionStatus.bgColor },
                  isSmallScreen && styles.statusBadgeSmall,
                ]}
              >
                <Text
                  style={[styles.statusText, { color: questionStatus.color }]}
                >
                  {questionStatus.text}
                </Text>
              </View>
            </TouchableOpacity>
            {/* Photos Card */}
            <TouchableOpacity
              style={[styles.taskCard, isSmallScreen && styles.taskCardSmall]}
              onPress={() => router.push("/photos")}
              activeOpacity={0.7}
            >
              <View
                style={[styles.taskInfo, isSmallScreen && styles.taskInfoSmall]}
              >
                <View style={styles.taskIcon}>
                  <Text style={styles.taskEmoji}>📸</Text>
                </View>
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{t("dashboard.photos")}</Text>
                  <Text style={styles.taskDescription}>
                    {t("dashboard.photosProgress", {
                      count: state.photos.length,
                    })}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: photoStatus.bgColor },
                  isSmallScreen && styles.statusBadgeSmall,
                ]}
              >
                <Text style={[styles.statusText, { color: photoStatus.color }]}>
                  {photoStatus.text}
                </Text>
              </View>
            </TouchableOpacity>
            {/* Song Card */}
            <TouchableOpacity
              style={[styles.taskCard, isSmallScreen && styles.taskCardSmall]}
              onPress={() => router.push("/song")}
              activeOpacity={0.7}
            >
              <View
                style={[styles.taskInfo, isSmallScreen && styles.taskInfoSmall]}
              >
                <View style={styles.taskIcon}>
                  <Text style={styles.taskEmoji}>🎵</Text>
                </View>

                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{t("dashboard.song")}</Text>
                  <Text style={styles.taskDescription}>
                    {latestSelectedSong
                      ? t("dashboard.songSelected", {
                          name: latestSelectedSong.name,
                        })
                      : t("dashboard.songNotSelected")}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: songStatus.bgColor },
                  isSmallScreen && styles.statusBadgeSmall,
                ]}
              >
                <Text style={[styles.statusText, { color: songStatus.color }]}>
                  {songStatus.text}
                </Text>
              </View>
            </TouchableOpacity>
          </Card>
        )}

        {/* Conditionally show button based on completion state */}
        {!isCompleted ? (
          <Button
            title={
              taskStatus.allTasksCompleted
                ? t("dashboard.finish")
                : t("dashboard.motivation")
            }
            onPress={() => router.push("/gift")}
            disabled={!taskStatus.allTasksCompleted}
          />
        ) : (
          <Card style={styles.completedContainer}>
            <TouchableOpacity
              style={[styles.taskCard, isSmallScreen && styles.taskCardSmall]}
              onPress={() => router.push("/galery")}
              activeOpacity={0.7}
            >
              <View
                style={[styles.taskInfo, isSmallScreen && styles.taskInfoSmall]}
              >
                <View style={styles.taskIcon}>
                  <Text style={styles.taskEmoji}>🖼️</Text>
                </View>
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{t("dashboard.gallery")}</Text>
                  <Text style={styles.taskDescription}>
                    {t("dashboard.galleryDescription")}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Show photos and songs still available after completion */}
            <TouchableOpacity
              style={[styles.taskCard, isSmallScreen && styles.taskCardSmall]}
              onPress={() => router.push("/photos")}
              activeOpacity={0.7}
            >
              <View
                style={[styles.taskInfo, isSmallScreen && styles.taskInfoSmall]}
              >
                <View style={styles.taskIcon}>
                  <Text style={styles.taskEmoji}>📸</Text>
                </View>
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>
                    {t("dashboard.morePhotos")}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.taskCard, isSmallScreen && styles.taskCardSmall]}
              onPress={() => router.push("/song")}
              activeOpacity={0.7}
            >
              <View
                style={[styles.taskInfo, isSmallScreen && styles.taskInfoSmall]}
              >
                <View style={styles.taskIcon}>
                  <Text style={styles.taskEmoji}>🎵</Text>
                </View>
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>
                    {t("dashboard.moreSongs")}
                  </Text>
                  <Text style={styles.taskDescription}></Text>
                </View>
              </View>
            </TouchableOpacity>
          </Card>
        )}
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
  settingsButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D9C4A0",
  },
  settingsButtonText: {
    fontSize: 18,
    color: "#7D5260",
  },
  greeting: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#D4526E",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 20,
    color: "#7D5260",
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D4526E",
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: "#FFD1DC",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#D4526E",
    borderRadius: 5,
  },
  tasksContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  taskCard: {
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
  taskCardSmall: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  taskInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  taskInfoSmall: {
    width: "100%",
    alignItems: "flex-start",
  },
  taskIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF5F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  taskEmoji: {
    fontSize: 24,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusBadgeSmall: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  completedContainer: {
    marginBottom: 30,
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
});
