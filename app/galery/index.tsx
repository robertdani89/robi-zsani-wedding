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
} from "react-native";
import { useEffect, useState } from "react";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { GalleryCollection } from "@/types";
import { StatusBar } from "expo-status-bar";
import apiService from "@/services/api";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";

export default function GalleryScreen() {
  const router = useRouter();
  const { t } = useLocalization();
  const [collections, setCollections] = useState<GalleryCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCollections = async () => {
    setIsLoading(true);

    try {
      const response = await apiService.getGalleryCollections();
      setCollections(response);
    } catch (error) {
      console.error("Gallery collections error:", error);
      Alert.alert(
        t("questions.errorTitle"),
        t("identify.connectionErrorMessage"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCollections();
  }, []);

  const openCollection = (collection: GalleryCollection) => {
    router.push({
      pathname: "/galery/[id]",
      params: {
        id: collection.id,
        title: collection.title,
        googlePhotosUrl: collection.googlePhotosUrl ?? "",
      },
    });
  };

  const openGooglePhotos = async (url?: string) => {
    if (!url) {
      return;
    }

    try {
      await Linking.openURL(url);
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

          <Text style={styles.title}>{t("gallery.title")}</Text>
          <Text style={styles.subtitle}>{t("gallery.subtitle")}</Text>
        </Card>

        {isLoading ? (
          <Card>
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#D4526E" />
              <Text style={styles.loadingText}>
                {t("gallery.loadingCollections")}
              </Text>
            </View>
          </Card>
        ) : collections.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🖼️</Text>
              <Text style={styles.emptyTitle}>
                {t("gallery.noCollectionsTitle")}
              </Text>
              <Text style={styles.emptySubtitle}>
                {t("gallery.noCollectionsSubtitle")}
              </Text>
              <Button
                title={t("gallery.tryAgain")}
                onPress={() => void loadCollections()}
                style={styles.retryButton}
              />
            </View>
          </Card>
        ) : (
          collections.map((collection) => (
            <Card key={collection.id} style={styles.collectionCard}>
              <TouchableOpacity
                onPress={() => openCollection(collection)}
                activeOpacity={0.8}
              >
                {collection.thumbnailUrl ? (
                  <Image
                    source={{ uri: collection.thumbnailUrl }}
                    style={styles.coverImage}
                    resizeMode="cover"
                  />
                ) : null}

                <Text style={styles.collectionTitle}>{collection.title}</Text>

                {collection.description ? (
                  <Text style={styles.collectionDescription}>
                    {collection.description}
                  </Text>
                ) : null}

                {typeof collection.photoCount === "number" ? (
                  <Text style={styles.photoCount}>
                    {t("gallery.photoCount", { count: collection.photoCount })}
                  </Text>
                ) : null}
              </TouchableOpacity>

              <View style={styles.actions}>
                <Button
                  title={t("gallery.openCollection")}
                  onPress={() => openCollection(collection)}
                  style={styles.primaryAction}
                />

                {collection.googlePhotosUrl ? (
                  <TouchableOpacity
                    style={styles.secondaryAction}
                    onPress={() =>
                      void openGooglePhotos(collection.googlePhotosUrl)
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.secondaryActionText}>
                      {t("gallery.openGooglePhotos")}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </Card>
          ))
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
    fontSize: 30,
    fontWeight: "bold",
    color: "#D4526E",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
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
  retryButton: {
    marginTop: 16,
    alignSelf: "stretch",
  },
  collectionCard: {
    marginBottom: 20,
  },
  coverImage: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: "#F8E4EA",
  },
  collectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  collectionDescription: {
    fontSize: 15,
    lineHeight: 21,
    color: "#666",
    marginBottom: 8,
  },
  photoCount: {
    fontSize: 14,
    color: "#A0522D",
    fontWeight: "600",
  },
  actions: {
    marginTop: 16,
    gap: 10,
  },
  primaryAction: {
    alignSelf: "stretch",
  },
  secondaryAction: {
    borderWidth: 1,
    borderColor: "#D4526E",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#D4526E",
  },
});
