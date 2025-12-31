import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";

export default function ReviewScreen() {
  const router = useRouter();
  const { state, markAsCompleted, getTaskStatus } = useApp();
  const taskStatus = getTaskStatus();

  const handleSubmit = async () => {
    if (!taskStatus.allTasksCompleted) {
      Alert.alert(
        "Incomplete Tasks",
        "Please complete all tasks before submitting.",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Submit Confirmation",
      "Are you ready to submit? You won't be able to change your answers after submission.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            await markAsCompleted();
            router.replace("/completion");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Review & Submit 📋</Text>
          <Text style={styles.subtitle}>
            Check your progress before submitting
          </Text>
        </View>

        {/* Progress Summary */}
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>Overall Progress</Text>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${taskStatus.progressPercentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressPercentageText}>
            {taskStatus.progressPercentage}% Complete
          </Text>
        </View>

        {/* Checklist */}
        <View style={styles.checklistCard}>
          <Text style={styles.cardTitle}>Task Checklist</Text>

          <View style={styles.checklistItem}>
            <View
              style={[
                styles.checkIcon,
                taskStatus.questionsCompleted && styles.checkIconCompleted,
              ]}
            >
              {taskStatus.questionsCompleted && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <View style={styles.checklistContent}>
              <Text style={styles.checklistTitle}>Questions Answered</Text>
              <Text style={styles.checklistDetail}>
                {state.answers.length} questions completed
              </Text>
            </View>
          </View>

          <View style={styles.checklistItem}>
            <View
              style={[
                styles.checkIcon,
                taskStatus.photosUploaded && styles.checkIconCompleted,
              ]}
            >
              {taskStatus.photosUploaded && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <View style={styles.checklistContent}>
              <Text style={styles.checklistTitle}>Photos Uploaded</Text>
              <Text style={styles.checklistDetail}>
                {state.photos.length} photo
                {state.photos.length !== 1 ? "s" : ""} uploaded
              </Text>
            </View>
          </View>
        </View>

        {/* Guest Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Your Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{state.guest?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>
              {new Date(state.guest?.createdAt || "").toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Status Message */}
        {taskStatus.allTasksCompleted ? (
          <View style={styles.successBox}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>All Tasks Completed!</Text>
            <Text style={styles.successMessage}>
              You're ready to submit and claim your gift
            </Text>
          </View>
        ) : (
          <View style={styles.warningBox}>
            <Text style={styles.warningEmoji}>⚠️</Text>
            <Text style={styles.warningTitle}>Tasks Incomplete</Text>
            <Text style={styles.warningMessage}>
              Please complete all tasks before submitting
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            !taskStatus.allTasksCompleted && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={!taskStatus.allTasksCompleted}
        >
          <Text style={styles.submitButtonText}>
            {taskStatus.allTasksCompleted
              ? "Submit & Claim Gift 🎁"
              : "Complete Tasks First"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Note: Once submitted, you won't be able to change your answers
        </Text>
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
    marginBottom: 25,
  },
  backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: "#D4526E",
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#D4526E",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#7D5260",
  },
  progressCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: "#FFD1DC",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#D4526E",
    borderRadius: 6,
  },
  progressPercentageText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  checklistCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#DDD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  checkIconCompleted: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkmark: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  checklistContent: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  checklistDetail: {
    fontSize: 14,
    color: "#666",
  },
  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },
  successBox: {
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 25,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 5,
  },
  successMessage: {
    fontSize: 15,
    color: "#2E7D32",
    textAlign: "center",
  },
  warningBox: {
    backgroundColor: "#FFF3E0",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 25,
  },
  warningEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF9800",
    marginBottom: 5,
  },
  warningMessage: {
    fontSize: 15,
    color: "#E65100",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#D4526E",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 15,
  },
  submitButtonDisabled: {
    backgroundColor: "#DDD",
    elevation: 0,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  note: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
});
