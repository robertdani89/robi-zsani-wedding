import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { useApp } from "@/context/AppContext";
import { useEvent } from "@/context/EventContext";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";

const getStatusBadge = (
  completed: boolean,
  inProgress: boolean,
  completedText: string,
  progressText: string,
  notStartedText: string,
) => {
  if (completed) {
    return {
      text: completedText,
      color: "#4CAF50",
      bgColor: "#E8F5E9",
    };
  }

  if (inProgress) {
    return {
      text: progressText,
      color: "#FF9800",
      bgColor: "#FFF3E0",
    };
  }

  return {
    text: notStartedText,
    color: "#9E9E9E",
    bgColor: "#F5F5F5",
  };
};

export default function DashboardTasksPanel() {
  const router = useRouter();
  const { state, getTaskStatus, resetApp } = useApp();
  const { leaveCurrentEvent } = useEvent();
  const { t } = useLocalization();
  const taskStatus = getTaskStatus();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const latestSelectedSong =
    state.song.length > 0 ? state.song[state.song.length - 1] : null;
  const isCompleted = !!state.guest?.gotGiftAt;

  const questionStatus = getStatusBadge(
    taskStatus.questionsCompleted,
    state.answers.length > 0 && !taskStatus.questionsCompleted,
    t("status.completed"),
    t("status.inProgress"),
    t("status.notStarted"),
  );
  const photoStatus = getStatusBadge(
    taskStatus.photosUploaded,
    state.photos.length > 0 && !taskStatus.photosUploaded,
    t("status.completed"),
    t("status.inProgress"),
    t("status.notStarted"),
  );
  const songStatus = getStatusBadge(
    taskStatus.songSelected,
    false,
    t("status.completed"),
    t("status.inProgress"),
    t("status.notStarted"),
  );

  const handleReset = () => {
    Alert.alert(
      t("common.resetConfirmTitle"),
      t("common.resetConfirmMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.reset"),
          style: "destructive",
          onPress: async () => {
            await resetApp();
            await leaveCurrentEvent();
            router.replace("/");
          },
        },
      ],
    );
  };

  return (
    <>
      {!isCompleted && (
        <Card style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>{t("dashboard.progress")}</Text>
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

      {!isCompleted && (
        <Card style={styles.tasksContainer}>
          <Text style={styles.sectionTitle}>{t("dashboard.tasks")}</Text>

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
                <Text style={styles.taskTitle}>{t("dashboard.questions")}</Text>
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

          <TouchableOpacity
            style={[styles.taskCard, isSmallScreen && styles.taskCardSmall]}
            onPress={() => router.push("/puzzle")}
            activeOpacity={0.7}
          >
            <View
              style={[styles.taskInfo, isSmallScreen && styles.taskInfoSmall]}
            >
              <View style={styles.taskIcon}>
                <Text style={styles.taskEmoji}>🧩</Text>
              </View>
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{t("dashboard.puzzle")}</Text>
                <Text style={styles.taskDescription}>
                  {t("dashboard.puzzleDescription")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

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
                <Text style={styles.taskTitle}>{t("dashboard.moreSongs")}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.taskCard, isSmallScreen && styles.taskCardSmall]}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <View
              style={[styles.taskInfo, isSmallScreen && styles.taskInfoSmall]}
            >
              <View style={styles.taskIcon}>
                <Text style={styles.taskEmoji}>🔄</Text>
              </View>
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{t("common.reset")}</Text>
                <Text style={styles.taskDescription}>
                  {t("common.resetDescription")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Card>
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
});
