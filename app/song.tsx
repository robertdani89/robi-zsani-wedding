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
import { useEffect, useState } from "react";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { Song } from "@/types";
import { StatusBar } from "expo-status-bar";
import apiService from "@/services/api";
import { useApp } from "@/context/AppContext";
import { useLocalization } from "@/context/LocalizationContext";
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
  const { t } = useLocalization();
  const selectedSongs = state.song;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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
        setError(t("song.searchFailed"));
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSong = async (result: SpotifySearchResult) => {
    if (!state.guest) return;

    const isAlreadySelected = selectedSongs.some(
      (song) => song.spotifyId === result.spotifyId,
    );
    if (isAlreadySelected) {
      setError(t("song.alreadySelected"));
      return;
    }

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
      setSearchQuery("");
    } catch (err) {
      console.error("Selection error:", err);
      setError(t("song.saveFailed"));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{t("common.back")}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{t("song.title")}</Text>

          <Text style={styles.infoText}>{t("song.info")}</Text>
        </Card>

        {/* Current Selections */}
        {selectedSongs.length > 0 && (
          <Card style={styles.currentSelection}>
            <Text style={styles.currentSelectionTitle}>
              {t("song.currentSelection")}
            </Text>
            {selectedSongs.map((song) => (
              <View key={song.id} style={styles.selectedSongCard}>
                {song.albumArt && (
                  <Image
                    source={{ uri: song.albumArt }}
                    style={styles.selectedAlbumArt}
                  />
                )}
                <View style={styles.selectedSongInfo}>
                  <Text style={styles.selectedSongName} numberOfLines={1}>
                    {song.name}
                  </Text>
                  <Text style={styles.selectedSongArtist} numberOfLines={1}>
                    {song.artist}
                  </Text>
                  <Text style={styles.selectedSongAlbum} numberOfLines={1}>
                    {song.album}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Search Section */}
        <Card style={styles.searchSection}>
          <Text style={styles.sectionTitle}>
            {selectedSongs.length > 0
              ? t("song.searchAnother")
              : t("song.search")}
          </Text>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={t("song.searchPlaceholder")}
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
        </Card>

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
            <Text style={styles.loadingText}>{t("song.searching")}</Text>
          </View>
        )}

        {/* Search Results */}
        {!isSearching && searchResults.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              {t("song.foundCount", { count: searchResults.length })}
            </Text>
            {searchResults.map((result) => (
              <TouchableOpacity
                key={result.spotifyId}
                style={styles.resultCard}
                onPress={() => handleSelectSong(result)}
                activeOpacity={0.7}
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
                  <Text style={styles.selectButtonText}>
                    {t("song.select")}
                  </Text>
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
              <Text style={styles.emptyStateText}>
                {t("song.emptyNotFoundTitle")}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {t("song.emptyNotFoundSubtitle")}
              </Text>
            </View>
          )}

        {/* Initial State */}
        {selectedSongs.length === 0 &&
          searchQuery.length < 2 &&
          searchResults.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🎧</Text>
              <Text style={styles.emptyStateText}>
                {t("song.emptyInitialTitle")}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {t("song.emptyInitialSubtitle")}
              </Text>
            </View>
          )}

        {/* Done Button */}
        {selectedSongs.length > 0 && (
          <Button
            title={t("common.done")}
            onPress={() => router.replace("/dashboard")}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 24,
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
    marginBottom: 12,
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
});
