import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useEffect, useMemo, useState } from "react";

import Card from "@/components/Card";
import { GalleryPhoto } from "@/types";
import { StatusBar } from "expo-status-bar";
import apiService from "@/services/api";
import { useLocalSearchParams } from "expo-router";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";

export default function GalleryDetailScreen() {
  const router = useRouter();
  const { t } = useLocalization();
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams<{
    id?: string | string[];
    title?: string | string[];
    googlePhotosUrl?: string | string[];
  }>();

  const collectionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const collectionTitle = Array.isArray(params.title)
    ? params.title[0]
    : params.title;
  const googlePhotosUrl = Array.isArray(params.googlePhotosUrl)
    ? params.googlePhotosUrl[0]
    : params.googlePhotosUrl;

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const selectedPhoto = useMemo(
    () => photos[currentIndex] ?? null,
    [currentIndex, photos],
  );

  const loadPhotos = async () => {
    if (!collectionId) {
      setPhotos([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response =
        await apiService.getGalleryCollectionPhotos(collectionId);
      setPhotos(response);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Gallery photos error:", error);
      Alert.alert(
        t("questions.errorTitle"),
        t("identify.connectionErrorMessage"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPhotos();
  }, [collectionId]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(photos.length - 1, 0) : prev - 1,
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const openGooglePhotos = async () => {
    if (!googlePhotosUrl) {
      return;
    }

    try {
      await Linking.openURL(googlePhotosUrl);
    } catch (error) {
      Alert.alert(
        t("questions.errorTitle"),
        t("identify.connectionErrorMessage"),
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{t("common.back")}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            {collectionTitle ?? t("gallery.title")}
          </Text>
          <Text style={styles.subtitle}>{t("gallery.tapThumbnail")}</Text>
        </Card>

        {isLoading ? (
          <Card>
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#D4526E" />
              <Text style={styles.loadingText}>
                {t("gallery.loadingPhotos")}
              </Text>
            </View>
          </Card>
        ) : !selectedPhoto ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📷</Text>
              <Text style={styles.emptyTitle}>
                {t("gallery.noPhotosTitle")}
              </Text>
              <Text style={styles.emptySubtitle}>
                {t("gallery.noPhotosSubtitle")}
              </Text>
            </View>
          </Card>
        ) : (
          <>
            <Card style={styles.previewCard}>
              <Image
                source={{ uri: selectedPhoto.displayUrl }}
                style={[
                  styles.previewImage,
                  { width: width - 86, height: Math.min(height * 0.42, 320) },
                ]}
                resizeMode="contain"
              />

              {selectedPhoto.title ? (
                <Text style={styles.previewTitle}>{selectedPhoto.title}</Text>
              ) : null}

              <Text style={styles.counterText}>
                {currentIndex + 1} / {photos.length}
              </Text>

              <View style={styles.navRow}>
                <TouchableOpacity
                  onPress={goToPrevious}
                  style={styles.navButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.navButtonText}>
                    {t("gallery.previous")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={goToNext}
                  style={styles.navButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.navButtonText}>{t("gallery.next")}</Text>
                </TouchableOpacity>
              </View>

              {googlePhotosUrl ? (
                <TouchableOpacity
                  onPress={() => void openGooglePhotos()}
                  style={styles.browserButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.browserButtonText}>
                    {t("gallery.openInBrowser")}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </Card>

            <Card>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailRow}
              >
                {photos.map((photo, index) => (
                  <TouchableOpacity
                    key={photo.id}
                    onPress={() => setCurrentIndex(index)}
                    activeOpacity={0.8}
                    style={[
                      styles.thumbnailFrame,
                      index === currentIndex && styles.thumbnailFrameActive,
                    ]}
                  >
                    <Image
                      source={{ uri: photo.thumbnailUrl }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Card>
          </>
        )}
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
    marginBottom: 24,
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
    fontSize: 28,
    fontWeight: "bold",
    color: "#D4526E",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#7D5260",
  },
  loadingState: {
    paddingVertical: 30,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#7D5260",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 10,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
  previewCard: {
    marginBottom: 20,
  },
  previewImage: {
    alignSelf: "center",
    borderRadius: 14,
    backgroundColor: "#FFF5F7",
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  counterText: {
    fontSize: 14,
    color: "#7D5260",
    marginBottom: 12,
  },
  navRow: {
    flexDirection: "row",
    gap: 10,
  },
  navButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#D4526E",
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },
  browserButton: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D4526E",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  browserButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#D4526E",
  },
  thumbnailRow: {
    gap: 12,
    paddingRight: 6,
  },
  thumbnailFrame: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 2,
  },
  thumbnailFrameActive: {
    borderColor: "#D4526E",
  },
  thumbnail: {
    width: 110,
    height: 84,
    borderRadius: 10,
    backgroundColor: "#F8E4EA",
  },
});
