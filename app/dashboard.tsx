import { MIN_PHOTOS_REQUIRED, MIN_QUESTIONS_TO_ANSWER } from "@/data/questions";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";

export default function DashboardScreen() {
  const router = useRouter();
  const { state, getTaskStatus } = useApp();
  const taskStatus = getTaskStatus();

  const getStatusBadge = (completed: boolean, inProgress: boolean) => {
    if (completed) {
      return { text: "Completed ✓", color: "#4CAF50", bgColor: "#E8F5E9" };
    }
    if (inProgress) {
      return { text: "In Progress", color: "#FF9800", bgColor: "#FFF3E0" };
    }
    return { text: "Not Started", color: "#9E9E9E", bgColor: "#F5F5F5" };
  };

  const questionStatus = getStatusBadge(
    taskStatus.questionsCompleted,
    state.answers.length > 0 && !taskStatus.questionsCompleted
  );

  const photoStatus = getStatusBadge(
    taskStatus.photosUploaded,
    state.photos.length > 0 && !taskStatus.photosUploaded
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi, {state.guest?.name}! 👋</Text>
          <Text style={styles.subtitle}>Let's complete your tasks</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Overall Progress</Text>
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
        </View>

        {/* Task Cards */}
        <View style={styles.tasksContainer}>
          <Text style={styles.sectionTitle}>Your Tasks</Text>

          {/* Questions Card */}
          <TouchableOpacity
            style={styles.taskCard}
            onPress={() => router.push("/questions")}
            activeOpacity={0.7}
          >
            <View style={styles.taskIcon}>
              <Text style={styles.taskEmoji}>❓</Text>
            </View>
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>Answer Questions</Text>
              <Text style={styles.taskDescription}>
                {state.answers.length} of {MIN_QUESTIONS_TO_ANSWER} completed
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: questionStatus.bgColor },
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
            style={styles.taskCard}
            onPress={() => router.push("/photos")}
            activeOpacity={0.7}
          >
            <View style={styles.taskIcon}>
              <Text style={styles.taskEmoji}>📸</Text>
            </View>
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>Upload Photos</Text>
              <Text style={styles.taskDescription}>
                {state.photos.length} of {MIN_PHOTOS_REQUIRED} minimum uploaded
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: photoStatus.bgColor },
              ]}
            >
              <Text style={[styles.statusText, { color: photoStatus.color }]}>
                {photoStatus.text}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomCTA}>
          {taskStatus.allTasksCompleted ? (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => router.push("/review")}
              activeOpacity={0.8}
            >
              <Text style={styles.reviewButtonText}>Review & Submit 🎉</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.motivationBox}>
              <Text style={styles.motivationText}>
                Complete all tasks to unlock your gift! 🎁
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  greeting: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#D4526E",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#7D5260",
  },
  progressContainer: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    padding: 20,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bottomCTA: {
    marginTop: 20,
  },
  reviewButton: {
    backgroundColor: "#D4526E",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  reviewButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  motivationBox: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#FFD1DC",
    borderStyle: "dashed",
  },
  motivationText: {
    fontSize: 16,
    color: "#7D5260",
    textAlign: "center",
    fontWeight: "600",
  },
});
