import * as ImagePicker from "expo-image-picker";

import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MAX_PHOTOS_ALLOWED, MIN_PHOTOS_REQUIRED } from "@/data/questions";

import { Photo } from "@/types";
import { StatusBar } from "expo-status-bar";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function PhotosScreen() {
  const router = useRouter();
  const { state, addPhoto, removePhoto } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to upload photos."
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    if (state.photos.length >= MAX_PHOTOS_ALLOWED) {
      Alert.alert(
        "Limit Reached",
        `You can only upload up to ${MAX_PHOTOS_ALLOWED} photos.`
      );
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera permissions to take photos."
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
        const newPhoto: Photo = {
          id: Date.now().toString(),
          guestId: state.guest!.id,
          uri: result.assets[0].uri,
          uploadedAt: new Date().toISOString(),
        };
        await addPhoto(newPhoto);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFromGallery = async () => {
    if (state.photos.length >= MAX_PHOTOS_ALLOWED) {
      Alert.alert(
        "Limit Reached",
        `You can only upload up to ${MAX_PHOTOS_ALLOWED} photos.`
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
        const newPhoto: Photo = {
          id: Date.now().toString(),
          guestId: state.guest!.id,
          uri: result.assets[0].uri,
          uploadedAt: new Date().toISOString(),
        };
        await addPhoto(newPhoto);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload photo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert("Delete Photo", "Are you sure you want to remove this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removePhoto(photoId),
      },
    ]);
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

          <Text style={styles.title}>Upload Photos 📸</Text>
          <Text style={styles.subtitle}>
            Share your fun moments at the wedding
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            📝 Minimum: {MIN_PHOTOS_REQUIRED} photo
            {MIN_PHOTOS_REQUIRED > 1 ? "s" : ""} required
          </Text>
          <Text style={styles.infoText}>
            📷 Maximum: {MAX_PHOTOS_ALLOWED} photos allowed
          </Text>
          <Text style={styles.infoText}>
            ✅ Current: {state.photos.length} photo
            {state.photos.length !== 1 ? "s" : ""} uploaded
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
            <Text style={styles.actionButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, isLoading && styles.buttonDisabled]}
            onPress={handleUploadFromGallery}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text style={styles.actionButtonIcon}>🖼️</Text>
            <Text style={styles.actionButtonText}>From Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Photo Grid */}
        {state.photos.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>Your Photos</Text>
            <View style={styles.photoGrid}>
              {state.photos.map((photo) => (
                <View key={photo.id} style={styles.photoContainer}>
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
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

        {state.photos.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>📸</Text>
            <Text style={styles.emptyStateText}>No photos yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Take a photo or upload from your gallery to get started
            </Text>
          </View>
        )}

        {state.photos.length >= MIN_PHOTOS_REQUIRED && (
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Done ✓</Text>
          </TouchableOpacity>
        )}
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
});
