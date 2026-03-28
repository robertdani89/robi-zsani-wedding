import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Card from "@/components/Card";
import { StatusBar } from "expo-status-bar";
import { useApp } from "@/context/AppContext";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";

export default function DashboardScreen() {
  const router = useRouter();
  const { state, getTaskStatus } = useApp();
  const taskStatus = getTaskStatus();
  const [fontsLoaded] = useFonts({
    GreatVibes: require("@/assets/GreatVibes-Regular.ttf"),
  });

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
          <Text style={[styles.text, styles.greeting]}>
            Szia, {state.guest?.name}! 👋
          </Text>
          <Text style={[styles.text, styles.subtitle]}>
            Nászutunkon minden választ elolvasunk
          </Text>
          <Text style={[styles.text, styles.subtitle]}>
            Kérlek, ne hagyd, hogy unatkozzunk a repülőn! 😉
          </Text>
        </Card>

        {/* Progress Bar */}
        <Card style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Mennyi van hátra?</Text>
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

        {/* Task Cards */}
        <Card style={styles.tasksContainer}>
          <Text style={styles.sectionTitle}>Feladatok</Text>

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
              <Text style={styles.taskTitle}>Kérdések</Text>
              <Text style={styles.taskDescription}>
                {state.answers.length} / {4} kérdés kész
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
              <Text style={styles.taskTitle}>Fotók feltöltése</Text>
              <Text style={styles.taskDescription}>
                {state.photos.length} / {1} minimum feltöltve
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

          {/* Song Card */}
          <TouchableOpacity
            style={styles.taskCard}
            onPress={() => router.push("/song")}
            activeOpacity={0.7}
          >
            <View style={styles.taskIcon}>
              <Text style={styles.taskEmoji}>🎵</Text>
            </View>
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>Válassz egy dalt</Text>
              <Text style={styles.taskDescription}>
                {state.song
                  ? `Kiválasztva: ${state.song.name}`
                  : "Válassz egy dalt a bulira"}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: songStatus.bgColor },
              ]}
            >
              <Text style={[styles.statusText, { color: songStatus.color }]}>
                {songStatus.text}
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Bottom CTA */}
        <View style={styles.bottomCTA}>
          {taskStatus.allTasksCompleted ? (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => router.push("/gift")}
              activeOpacity={0.8}
            >
              <Text style={styles.reviewButtonText}>Végeztem!</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.motivationBox}>
              <Text style={styles.motivationText}>
                Fejezd be a feladatokat, hogy megkapd az ajándékodat! 🎁
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
