import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";

export default function CompletionScreen() {
  const router = useRouter();
  const { state } = useApp();

  const handleBackToDashboard = () => {
    router.replace("/dashboard");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.celebrationSection}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationText}>Congratulations!</Text>
          <Text style={styles.completionMessage}>
            You've completed all tasks
          </Text>
        </View>

        <View style={styles.giftCard}>
          <Text style={styles.giftEmoji}>🎁</Text>
          <Text style={styles.giftTitle}>You're Gift Eligible!</Text>
          <Text style={styles.giftMessage}>
            Show this screen to the wedding hosts to receive your gift
          </Text>

          <View style={styles.confirmationBox}>
            <Text style={styles.confirmationLabel}>Confirmation Code</Text>
            <Text style={styles.confirmationCode}>
              {state.guest?.id.slice(-8).toUpperCase()}
            </Text>
          </View>

          <View style={styles.guestInfo}>
            <Text style={styles.guestName}>{state.guest?.name}</Text>
            <Text style={styles.completionDate}>
              Completed on{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Contribution</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{state.answers.length}</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{state.photos.length}</Text>
              <Text style={styles.statLabel}>Photos</Text>
            </View>
          </View>
        </View>

        <View style={styles.thanksSection}>
          <Text style={styles.thanksMessage}>
            Thank you for being part of our special day and helping us create
            beautiful memories! 💕
          </Text>
          <Text style={styles.coupleNames}>- Robi & Zsani</Text>
        </View>

        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={handleBackToDashboard}
          activeOpacity={0.8}
        >
          <Text style={styles.dashboardButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F7",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  celebrationSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  celebrationEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  celebrationText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#D4526E",
    marginBottom: 10,
    textAlign: "center",
  },
  completionMessage: {
    fontSize: 18,
    color: "#7D5260",
    textAlign: "center",
  },
  giftCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 30,
    marginBottom: 25,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 3,
    borderColor: "#D4526E",
  },
  giftEmoji: {
    fontSize: 64,
    marginBottom: 15,
  },
  giftTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#D4526E",
    marginBottom: 10,
  },
  giftMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 24,
  },
  confirmationBox: {
    backgroundColor: "#FFF5F7",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FFD1DC",
    borderStyle: "dashed",
  },
  confirmationLabel: {
    fontSize: 13,
    color: "#999",
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 1,
  },
  confirmationCode: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#D4526E",
    letterSpacing: 4,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  guestInfo: {
    alignItems: "center",
  },
  guestName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  completionDate: {
    fontSize: 14,
    color: "#999",
  },
  statsCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 25,
    marginBottom: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#D4526E",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#FFD1DC",
    marginHorizontal: 20,
  },
  thanksSection: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 25,
    marginBottom: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  thanksMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 15,
  },
  coupleNames: {
    fontSize: 18,
    color: "#D4526E",
    fontWeight: "600",
    textAlign: "center",
    fontStyle: "italic",
  },
  dashboardButton: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#D4526E",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  dashboardButtonText: {
    color: "#D4526E",
    fontSize: 16,
    fontWeight: "bold",
  },
});
