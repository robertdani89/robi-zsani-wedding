import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";

import { Song } from "@/types";
import { StatusBar } from "expo-status-bar";
import apiService from "@/services/api";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";

interface SpotifySearchResult {
  spotifyId: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string | null;
  previewUrl: string | null;
}

export default function SongScreen() {
  const router = useRouter();
  const { state, setSong } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const results = await apiService.searchSongs(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to search songs. Please try again.");
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSong = async (result: SpotifySearchResult) => {
    if (!state.guest) return;

    setIsSelecting(true);
    setError(null);
    try {
      const savedSong = await apiService.selectSong({
        spotifyId: result.spotifyId,
        name: result.name,
        artist: result.artist,
        album: result.album,
        albumArt: result.albumArt || undefined,
        previewUrl: result.previewUrl || undefined,
        guestId: state.guest.id,
      });

      // Save locally
      const localSong: Song = {
        id: savedSong.id,
        spotifyId: savedSong.spotifyId,
        name: savedSong.name,
        artist: savedSong.artist,
        album: savedSong.album,
        albumArt: savedSong.albumArt,
        previewUrl: savedSong.previewUrl,
        selectedAt: new Date().toISOString(),
      };

      await setSong(localSong);
      router.replace("/dashboard");
    } catch (err) {
      console.error("Selection error:", err);
      setError("Failed to save song. Please try again.");
    } finally {
      setIsSelecting(false);
    }
  };

  const handleChangeSong = () => {
    // Clear current song selection UI but don't delete from server yet
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Pick a Song 🎵</Text>
          <Text style={styles.subtitle}>
            Choose a song you'd love to hear at the wedding party!
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            🎶 Search for your favorite song below
          </Text>
          <Text style={styles.infoText}>
            💃 We'll try to play it during the celebration
          </Text>
          <Text style={styles.infoText}>
            ❤️ Pick something that makes you want to dance!
          </Text>
        </View>

        {/* Current Selection */}
        {state.song && (
          <View style={styles.currentSelection}>
            <Text style={styles.currentSelectionTitle}>Your Selection</Text>
            <View style={styles.selectedSongCard}>
              {state.song.albumArt && (
                <Image
                  source={{ uri: state.song.albumArt }}
                  style={styles.selectedAlbumArt}
                />
              )}
              <View style={styles.selectedSongInfo}>
                <Text style={styles.selectedSongName} numberOfLines={1}>
                  {state.song.name}
                </Text>
                <Text style={styles.selectedSongArtist} numberOfLines={1}>
                  {state.song.artist}
                </Text>
                <Text style={styles.selectedSongAlbum} numberOfLines={1}>
                  {state.song.album}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={handleChangeSong}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>
            {state.song ? "Search for a different song" : "Search for a song"}
          </Text>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search songs or artists..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Loading Indicator */}
        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4526E" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {/* Search Results */}
        {!isSearching && searchResults.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              {searchResults.length} songs found
            </Text>
            {searchResults.map((result) => (
              <TouchableOpacity
                key={result.spotifyId}
                style={styles.resultCard}
                onPress={() => handleSelectSong(result)}
                activeOpacity={0.7}
                disabled={isSelecting}
              >
                {result.albumArt ? (
                  <Image
                    source={{ uri: result.albumArt }}
                    style={styles.albumArt}
                  />
                ) : (
                  <View style={[styles.albumArt, styles.albumArtPlaceholder]}>
                    <Text style={styles.albumArtPlaceholderText}>🎵</Text>
                  </View>
                )}
                <View style={styles.songInfo}>
                  <Text style={styles.songName} numberOfLines={1}>
                    {result.name}
                  </Text>
                  <Text style={styles.songArtist} numberOfLines={1}>
                    {result.artist}
                  </Text>
                  <Text style={styles.songAlbum} numberOfLines={1}>
                    {result.album}
                  </Text>
                </View>
                <View style={styles.selectButton}>
                  <Text style={styles.selectButtonText}>Select</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {!isSearching &&
          searchQuery.length >= 2 &&
          searchResults.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🎵</Text>
              <Text style={styles.emptyStateText}>No songs found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try a different search term
              </Text>
            </View>
          )}

        {/* Initial State */}
        {!state.song &&
          searchQuery.length < 2 &&
          searchResults.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🎧</Text>
              <Text style={styles.emptyStateText}>Ready to pick a song?</Text>
              <Text style={styles.emptyStateSubtext}>
                Type at least 2 characters to search
              </Text>
            </View>
          )}

        {/* Selecting Overlay */}
        {isSelecting && (
          <View style={styles.selectingOverlay}>
            <ActivityIndicator size="large" color="#D4526E" />
            <Text style={styles.selectingText}>Saving your selection...</Text>
          </View>
        )}

        {/* Done Button */}
        {state.song && (
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.replace("/dashboard")}
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
    backgroundColor: "#FFF9F0",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    marginTop: 40,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: "#D4526E",
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  currentSelection: {
    marginBottom: 24,
  },
  currentSelectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  selectedSongCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  selectedAlbumArt: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  selectedSongInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectedSongName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  selectedSongArtist: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  selectedSongAlbum: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  changeButton: {
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  changeButtonText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  searchSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  searchInputContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    color: "#333",
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: "#999",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  resultsSection: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  albumArt: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  albumArtPlaceholder: {
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  albumArtPlaceholderText: {
    fontSize: 24,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  songArtist: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  songAlbum: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  selectButton: {
    backgroundColor: "#D4526E",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  selectButtonText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  selectingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#333",
  },
  doneButton: {
    backgroundColor: "#D4526E",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
});
