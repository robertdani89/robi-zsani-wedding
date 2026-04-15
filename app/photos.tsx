import * as ImagePicker from "expo-image-picker";

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MAX_PHOTOS_ALLOWED, MIN_PHOTOS_REQUIRED } from "@/data/questions";

import Button from "@/components/Button";
import Card from "@/components/Card";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Photo } from "@/types";
import { StatusBar } from "expo-status-bar";
import apiService from "@/services/api";
import { useApp } from "@/context/AppContext";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function PhotosScreen() {
  const router = useRouter();
  const { state, addPhoto, removePhoto } = useApp();
  const { t } = useLocalization();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingPhotoUri, setUploadingPhotoUri] = useState<string | null>(
    null,
  );
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("photos.permissionTitle"), t("photos.galleryPermission"));
      return false;
    }
    return true;
  };

  const uploadPhotoToServer = async (uri: string) => {
    try {
      setUploadingPhotoUri(uri);

      // Upload to server
      const serverPhoto = await apiService.uploadPhoto(state.guest!.id, uri);

      // Save locally with server photo ID
      const newPhoto: Photo = {
        id: serverPhoto.id,
        guestId: state.guest!.id,
        uri: uri, // Keep local URI for display
        uploadedAt: serverPhoto.createdAt,
      };

      await addPhoto(newPhoto);
      return true;
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        t("photos.uploadFailedTitle"),
        t("photos.uploadFailedMessage"),
      );
      return false;
    } finally {
      setUploadingPhotoUri(null);
    }
  };

  const handleTakePhoto = async () => {
    if (state.photos.length >= MAX_PHOTOS_ALLOWED) {
      Alert.alert(
        t("photos.limitTitle"),
        t("photos.limitMessage", { count: MAX_PHOTOS_ALLOWED }),
      );
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("photos.permissionTitle"), t("photos.cameraPermission"));
      return;
    }

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhotoToServer(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(t("photos.errorTitle"), t("photos.uploadRetry"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFromGallery = async () => {
    if (state.photos.length >= MAX_PHOTOS_ALLOWED) {
      Alert.alert(
        t("photos.limitTitle"),
        t("photos.limitMessage", { count: MAX_PHOTOS_ALLOWED }),
      );
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const remainingSlots = MAX_PHOTOS_ALLOWED - state.photos.length;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        for (const asset of result.assets.slice(0, remainingSlots)) {
          await uploadPhotoToServer(asset.uri);
        }
      }
    } catch (error) {
      Alert.alert(t("photos.errorTitle"), t("photos.uploadRetry"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotoToDelete(photoId);
    setDeleteModalVisible(true);
  };

  const confirmDeletePhoto = async () => {
    if (!photoToDelete) return;

    setIsDeleting(true);
    try {
      // Delete locally first (optimistic update)
      await removePhoto(photoToDelete);

      // Then try to delete from server
      try {
        await apiService.deletePhoto(photoToDelete);
      } catch (serverError) {
        // Log server error but don't revert - photo is already removed from UI
        console.error("Server delete error:", serverError);
      }
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert(
        t("photos.deleteFailedTitle"),
        t("photos.deleteFailedMessage"),
      );
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
      setPhotoToDelete(null);
    }
  };

  const cancelDeletePhoto = () => {
    setDeleteModalVisible(false);
    setPhotoToDelete(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{t("common.back")}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{t("photos.title")}</Text>
          <Text style={styles.subtitle}>{t("photos.subtitle")}</Text>
        </Card>

        <Card>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              {t("photos.minimum", { count: MIN_PHOTOS_REQUIRED })}
            </Text>
            <Text style={styles.infoText}>
              {t("photos.uploaded", { count: state.photos.length })}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, isLoading && styles.buttonDisabled]}
              onPress={handleTakePhoto}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.actionButtonIcon}>📷</Text>
              <Text style={styles.actionButtonText}>
                {t("photos.takePhoto")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, isLoading && styles.buttonDisabled]}
              onPress={handleUploadFromGallery}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.actionButtonIcon}>🖼️</Text>
              <Text style={styles.actionButtonText}>
                {t("photos.fromGallery")}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Photo Grid */}
        {state.photos.length > 0 && (
          <View style={styles.photosSection}>
            <Card style={styles.sectionTitle}>
              <Text>{t("photos.yourPhotos")}</Text>
            </Card>
            <View style={styles.photoGrid}>
              {state.photos.map((photo) => (
                <View key={photo.id} style={styles.photoContainer}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePhoto(photo.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Upload in progress indicator */}
        {uploadingPhotoUri && (
          <View style={styles.uploadingContainer}>
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#D4526E" />
              <Text style={styles.uploadingText}>{t("photos.uploading")}</Text>
            </View>
          </View>
        )}

        {state.photos.length === 0 && (
          <View style={styles.emptyState}>
            <Card>
              <Text style={styles.emptyStateEmoji}>📸</Text>
              <Text style={styles.emptyStateText}>
                {t("photos.emptyTitle")}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {t("photos.emptySubtitle")}
              </Text>
            </Card>
          </View>
        )}

        {state.photos.length >= MIN_PHOTOS_REQUIRED && (
          <Button
            onPress={() => router.replace("/dashboard")}
            title={t("common.done")}
          />
        )}
      </ScrollView>

      <ConfirmationModal
        visible={deleteModalVisible}
        title={t("photos.deleteTitle")}
        message={t("photos.deleteMessage")}
        confirmText={isDeleting ? t("photos.deleting") : t("photos.delete")}
        cancelText={t("common.cancel")}
        onConfirm={confirmDeletePhoto}
        onCancel={cancelDeletePhoto}
        confirmStyle="destructive"
      />
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
  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 8,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#D4526E",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  actionButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#D4526E",
    fontWeight: "600",
  },
  photosSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 15,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  photoContainer: {
    width: "47%",
    aspectRatio: 1,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    backgroundColor: "#FFD1DC",
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyState: {
    marginTop: 50,
    alignItems: "center",
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
  },
  uploadingContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  uploadingOverlay: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  uploadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
});
