import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Answer, Guest, Question, Song } from "@/types";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { StatusBar } from "expo-status-bar";
import apiService from "@/services/api";
import { useLocalization } from "@/context/LocalizationContext";

interface PhotoData {
  id: string;
  filename: string;
  guestId: string;
  createdAt: string;
}

const { width: screenWidth } = Dimensions.get("window");

export default function GuestDetailScreen() {
  const router = useRouter();
  const { locale, t } = useLocalization();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [answers, setAnswers] = useState<(Answer & { question?: Question })[]>(
    [],
  );
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadGuestData();
    }
  }, [id]);

  const loadGuestData = async () => {
    setIsLoading(true);
    try {
      const [guestData, answersData, photosData, songData] = await Promise.all([
        apiService.getGuest(id!),
        apiService.getGuestAnswersWithQuestions(id!),
        apiService.getGuestPhotos(id!),
        apiService.getGuestSong(id!),
      ]);

      setGuest(guestData);
      setAnswers(answersData);
      setPhotos(photosData as any);
      setSong(songData);
    } catch (error) {
      console.error("Error loading guest data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAnswer = (
    value: Answer["value"],
    question?: Question,
  ): string => {
    const getOptionLabel = (index: number): string => {
      if (!question?.options || !question.options[index]) {
        return String(index);
      }
      return question.options[index][locale];
    };

    if (Array.isArray(value)) {
      return value
        .map((item) =>
          typeof item === "number" ? getOptionLabel(item) : String(item),
        )
        .join(", ");
    }

    if (typeof value === "number") {
      return getOptionLabel(value);
    }

    return value;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4526E" />
        <Text style={styles.loadingText}>{t("adminGuest.loading")}</Text>
      </View>
    );
  }

  if (!guest) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{t("adminGuest.notFound")}</Text>
        <TouchableOpacity
          style={styles.backButtonAlt}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonAltText}>{t("adminGuest.goBack")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{t("common.back")}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{guest.name}</Text>
        <Text style={styles.subtitle}>
          {t("admin.joined")}:{" "}
          {new Date(guest.createdAt).toLocaleString(
            locale === "hu" ? "hu-HU" : "en-US",
          )}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Overview */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{answers.length}</Text>
            <Text style={styles.statLabel}>{t("admin.answers")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{photos.length}</Text>
            <Text style={styles.statLabel}>{t("admin.photos")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{song ? "✓" : "—"}</Text>
            <Text style={styles.statLabel}>{t("adminGuest.statsSong")}</Text>
          </View>
        </View>

        {/* Song Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("adminGuest.songPick")}</Text>
          {!song ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t("adminGuest.noSong")}</Text>
            </View>
          ) : (
            <View style={styles.songCard}>
              {song.albumArt && (
                <Image
                  source={{ uri: song.albumArt }}
                  style={styles.songAlbumArt}
                />
              )}
              <View style={styles.songInfo}>
                <Text style={styles.songName} numberOfLines={2}>
                  {song.name}
                </Text>
                <Text style={styles.songArtist} numberOfLines={1}>
                  {song.artist}
                </Text>
                <Text style={styles.songAlbum} numberOfLines={1}>
                  {song.album}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Answers Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("adminGuest.answersSection")}
          </Text>
          {answers.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t("adminGuest.noAnswers")}</Text>
            </View>
          ) : (
            answers.map((answer, index) => (
              <View key={answer.id || index} style={styles.answerCard}>
                <Text style={styles.questionText}>
                  {answer.question?.text ||
                    t("adminGuest.questionFallback", { id: answer.questionId })}
                </Text>
                <Text style={styles.answerText}>
                  {formatAnswer(answer.value, answer.question)}
                </Text>
                <Text style={styles.answerDate}>
                  {new Date(answer.answeredAt).toLocaleString(
                    locale === "hu" ? "hu-HU" : "en-US",
                  )}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Photos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("adminGuest.photosSection")}
          </Text>
          {photos.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t("adminGuest.noPhotos")}</Text>
            </View>
          ) : (
            <View style={styles.photoGrid}>
              {photos.map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  style={styles.photoThumbnail}
                  onPress={() => setSelectedPhoto(photo.id)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: apiService.getPhotoThumbnailUrl(photo.id) }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Photo Modal */}
      <Modal
        visible={selectedPhoto !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setSelectedPhoto(null)}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          {selectedPhoto && (
            <Image
              source={{ uri: apiService.getPhotoUrl(selectedPhoto) }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
  errorText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#D4526E",
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
  backButtonAlt: {
    backgroundColor: "#D4526E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  backButtonAltText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statsCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 30,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#D4526E",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#EEE",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  emptyCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#999",
  },
  answerCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  questionText: {
    fontSize: 15,
    color: "#666",
    marginBottom: 8,
    fontStyle: "italic",
  },
  answerText: {
    fontSize: 17,
    color: "#333",
    fontWeight: "600",
  },
  answerDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  photoThumbnail: {
    width: (screenWidth - 60) / 3,
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#FFD1DC",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  songCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  songAlbumArt: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  songInfo: {
    flex: 1,
    marginLeft: 16,
  },
  songName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 15,
    color: "#666",
    marginBottom: 2,
  },
  songAlbum: {
    fontSize: 13,
    color: "#999",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  modalCloseText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  fullImage: {
    width: screenWidth - 40,
    height: "80%",
  },
});
