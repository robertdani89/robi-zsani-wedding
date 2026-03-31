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

import Card from "@/components/Card";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Photo } from "@/types";
import { StatusBar } from "expo-status-bar";
import apiService from "@/services/api";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function PhotosScreen() {
  const router = useRouter();
  const { state, addPhoto, removePhoto } = useApp();
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
      Alert.alert(
        "Engedély Szükséges",
        "Bocsánat, szükségünk van a fotótár engedélyére a fotók feltöltéséhez.",
      );
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
        "Upload Failed",
        "Could not upload the photo to the server. Please check your connection and try again.",
      );
      return false;
    } finally {
      setUploadingPhotoUri(null);
    }
  };

  const handleTakePhoto = async () => {
    if (state.photos.length >= MAX_PHOTOS_ALLOWED) {
      Alert.alert(
        "Limit Reached",
        `You can only upload up to ${MAX_PHOTOS_ALLOWED} photos.`,
      );
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Engedély Szükséges",
        "Bocsánat, szükségünk van a kamera engedélyére a fotók készítéséhez.",
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhotoToServer(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        "Hiba",
        "Nem sikerült feltölteni a fotót. Kérlek próbáld újra.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFromGallery = async () => {
    if (state.photos.length >= MAX_PHOTOS_ALLOWED) {
      Alert.alert(
        "Limit Reached",
        `You can only upload up to ${MAX_PHOTOS_ALLOWED} photos.`,
      );
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhotoToServer(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload photo. Please try again.");
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
        "Delete Failed",
        "Could not delete the photo. Please try again.",
      );
    } finally {
      setIsDeleting(true);
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
            <Text style={styles.backButtonText}>← Vissza</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Fényképek feltöltése 📸</Text>
          <Text style={styles.subtitle}>
            Oszd meg a szórakoztató pillanataidat az esküvőn
          </Text>
        </Card>

        <Card>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              📝 Minimum: {MIN_PHOTOS_REQUIRED} fotó
            </Text>
            <Text style={styles.infoText}>
              ✅ Feltöltöttél eddig {state.photos.length} fotót
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
              <Text style={styles.actionButtonText}>Készíts fotót</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, isLoading && styles.buttonDisabled]}
              onPress={handleUploadFromGallery}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.actionButtonIcon}>🖼️</Text>
              <Text style={styles.actionButtonText}>Gallériából</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Photo Grid */}
        {state.photos.length > 0 && (
          <View style={styles.photosSection}>
            <Card style={styles.sectionTitle}>A te fotóid</Card>
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
              <Text style={styles.uploadingText}>Feltöltés folyamatban...</Text>
            </View>
          </View>
        )}

        {state.photos.length === 0 && (
          <View style={styles.emptyState}>
            <Card>
              <Text style={styles.emptyStateEmoji}>📸</Text>
              <Text style={styles.emptyStateText}>
                Még nem töltöttél fel fotókat
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Készíts egy fotót vagy tölts fel a galériádból
              </Text>
            </Card>
          </View>
        )}

        {state.photos.length >= MIN_PHOTOS_REQUIRED && (
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.replace("/dashboard")}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Kész ✓</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ConfirmationModal
        visible={deleteModalVisible}
        title="Fotó törlése"
        message="Biztosan el akarod távolítani ezt a fotót?"
        confirmText={isDeleting ? "Törlés..." : "Törlés"}
        cancelText="Mégse"
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
  doneButton: {
    backgroundColor: "#D4526E",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: 15,
  },
  doneButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
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
