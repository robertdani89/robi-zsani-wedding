import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";

import { StatusBar } from "expo-status-bar";
import apiService from "@/services/api";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";

interface GuestSummary {
  id: string;
  name: string;
  createdAt: string;
  answerCount: number;
  photoCount: number;
  hasSong?: boolean;
  songName?: string | null;
}

export default function AdminScreen() {
  const router = useRouter();
  const { locale, t } = useLocalization();
  const [guests, setGuests] = useState<GuestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchGuests = useCallback(async () => {
    try {
      const data = await apiService.getAllGuestsWithStats();
      setGuests(data);
    } catch (error) {
      console.error("Error fetching guests:", error);
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await fetchGuests();
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchGuests();
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGuestPress = (guestId: string) => {
    router.push(`/admin/guest/${guestId}`);
  };

  const handleLogout = () => {
    router.replace("/identify");
  };

  const renderGuestItem = ({ item }: { item: GuestSummary }) => (
    <TouchableOpacity
      style={styles.guestCard}
      onPress={() => handleGuestPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.guestInfo}>
        <Text style={styles.guestName}>{item.name}</Text>
        <Text style={styles.guestDate}>
          {t("admin.joined")}:{" "}
          {new Date(item.createdAt).toLocaleDateString(
            locale === "hu" ? "hu-HU" : "en-US",
          )}
        </Text>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{item.answerCount}</Text>
          <Text style={styles.statLabel}>{t("admin.answers")}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{item.photoCount}</Text>
          <Text style={styles.statLabel}>{t("admin.photos")}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{item.hasSong ? "🎵" : "—"}</Text>
          <Text style={styles.statLabel}>{t("admin.song")}</Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4526E" />
        <Text style={styles.loadingText}>{t("admin.loadingGuests")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>{t("admin.title")}</Text>
        <Text style={styles.subtitle}>
          {t("admin.registeredGuests", {
            count: guests.length,
            suffix: guests.length !== 1 ? "s" : "",
          })}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          <Text style={styles.refreshButtonText}>{t("admin.refresh")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutButtonText}>{t("admin.exit")}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={guests}
        renderItem={renderGuestItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#D4526E"]}
            tintColor="#D4526E"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>👥</Text>
            <Text style={styles.emptyStateText}>
              {t("admin.emptyGuestsTitle")}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {t("admin.emptyGuestsSubtitle")}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF5F7",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#D4526E",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  refreshButton: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D4526E",
  },
  refreshButtonText: {
    color: "#D4526E",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#7D5260",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  guestCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  guestDate: {
    fontSize: 13,
    color: "#999",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 15,
    marginRight: 10,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D4526E",
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
  },
  chevron: {
    fontSize: 24,
    color: "#CCC",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
