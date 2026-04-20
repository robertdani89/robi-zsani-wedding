import {
  ActivityIndicator,
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { PendingSongReview } from "@/types";
import { StatusBar } from "expo-status-bar";
import apiService from "@/services/api";
import { useApp } from "@/context/AppContext";
import { useEvent } from "@/context/EventContext";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";

const SWIPE_THRESHOLD = 120;
const OFFSCREEN_DISTANCE = 420;

export default function AssistScreen() {
  const router = useRouter();
  const { locale, t } = useLocalization();
  const { state } = useApp();
  const { activeEvent } = useEvent();
  const [song, setSong] = useState<PendingSongReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const position = useRef(new Animated.ValueXY()).current;

  const loadNextSong = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextSong = await apiService.getNextPendingSong();
      setSong(nextSong);
    } catch (loadError) {
      console.error("Error loading pending song:", loadError);
      setSong(null);
      setError(t("assist.error"));
    } finally {
      position.setValue({ x: 0, y: 0 });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const resolvedRole = state.guest?.role ?? activeEvent?.role ?? "guest";

    if (resolvedRole !== "organizer" && resolvedRole !== "assistant") {
      router.replace("/dashboard");
      return;
    }

    void loadNextSong();
  }, [activeEvent?.role, router, state.guest?.role]);

  const completeDecision = async (allowed: boolean) => {
    if (!song) {
      return;
    }

    setIsSubmitting(true);
    setSong(null);

    try {
      await apiService.updateSongAllowed(song.id, allowed);
      await loadNextSong();
    } catch (submitError) {
      console.error("Error updating song review:", submitError);
      setError(t("assist.error"));
      setSong(song);
      position.setValue({ x: 0, y: 0 });
      setIsLoading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const animateDecision = (allowed: boolean) => {
    if (!song || isSubmitting) {
      return;
    }

    const direction = allowed ? 1 : -1;

    Animated.timing(position, {
      toValue: { x: direction * OFFSCREEN_DISTANCE, y: 0 },
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      void completeDecision(allowed);
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 12 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderMove: (_, gestureState) => {
          if (isSubmitting) {
            return;
          }

          position.setValue({ x: gestureState.dx, y: gestureState.dy * 0.08 });
        },
        onPanResponderRelease: (_, gestureState) => {
          if (isSubmitting) {
            return;
          }

          if (gestureState.dx > SWIPE_THRESHOLD) {
            animateDecision(true);
            return;
          }

          if (gestureState.dx < -SWIPE_THRESHOLD) {
            animateDecision(false);
            return;
          }

          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
        },
      }),
    [isSubmitting, song],
  );

  const cardRotation = position.x.interpolate({
    inputRange: [-240, 0, 240],
    outputRange: ["-12deg", "0deg", "12deg"],
    extrapolate: "clamp",
  });

  const acceptOpacity = position.x.interpolate({
    inputRange: [0, 60, 150],
    outputRange: [0, 0.45, 1],
    extrapolate: "clamp",
  });

  const rejectOpacity = position.x.interpolate({
    inputRange: [-150, -60, 0],
    outputRange: [1, 0.45, 0],
    extrapolate: "clamp",
  });

  const submittedDate = song?.selectedAt
    ? new Date(song.selectedAt).toLocaleString(
        locale === "hu" ? "hu-HU" : "en-US",
      )
    : null;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <Card style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{t("common.back")}</Text>
          </TouchableOpacity>
        </Card>
        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#D4526E" />
            <Text style={styles.stateText}>{t("assist.loading")}</Text>
          </View>
        ) : error ? (
          <Card style={styles.feedbackCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title={t("assist.tryAgain")}
              onPress={() => void loadNextSong()}
            />
          </Card>
        ) : !song ? (
          <Card style={styles.feedbackCard}>
            <Text style={styles.emptyEmoji}>🎵</Text>
            <Text style={styles.emptyTitle}>{t("assist.emptyTitle")}</Text>
            <Text style={styles.emptySubtitle}>
              {t("assist.emptySubtitle")}
            </Text>
            <Button
              title={t("assist.tryAgain")}
              onPress={() => void loadNextSong()}
            />
          </Card>
        ) : (
          <>
            <View style={styles.deckArea}>
              <View style={styles.shadowCard} />
              <Animated.View
                style={[
                  styles.songCardWrapper,
                  {
                    transform: [
                      { translateX: position.x },
                      { translateY: position.y },
                      { rotate: cardRotation },
                    ],
                  },
                ]}
                {...panResponder.panHandlers}
              >
                <Card style={styles.songCard}>
                  <View style={styles.imageFrame}>
                    {song.albumArt ? (
                      <Image
                        source={{ uri: song.albumArt }}
                        style={styles.albumArt}
                      />
                    ) : (
                      <View style={styles.albumArtFallback}>
                        <Text style={styles.albumArtFallbackEmoji}>🎶</Text>
                        <Text style={styles.albumArtFallbackText}>
                          {t("assist.imageFallback")}
                        </Text>
                      </View>
                    )}

                    <Animated.View
                      style={[
                        styles.decisionBadge,
                        styles.rejectBadge,
                        { opacity: rejectOpacity },
                      ]}
                    >
                      <Text style={styles.decisionBadgeText}>
                        {t("assist.reject")}
                      </Text>
                    </Animated.View>

                    <Animated.View
                      style={[
                        styles.decisionBadge,
                        styles.acceptBadge,
                        { opacity: acceptOpacity },
                      ]}
                    >
                      <Text style={styles.decisionBadgeText}>
                        {t("assist.approve")}
                      </Text>
                    </Animated.View>
                  </View>

                  <View style={styles.songMeta}>
                    <Text style={styles.songName}>{song.name}</Text>
                    <Text style={styles.songArtist}>{song.artist}</Text>
                    <Text style={styles.songAlbum}>
                      {song.album || t("assist.albumFallback")}
                    </Text>

                    {song.guestName ? (
                      <Text style={styles.supportingText}>
                        {t("assist.submittedBy", { name: song.guestName })}
                      </Text>
                    ) : null}

                    {submittedDate ? (
                      <Text style={styles.supportingText}>
                        {t("assist.submittedAt", { date: submittedDate })}
                      </Text>
                    ) : null}
                  </View>
                </Card>
              </Animated.View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.rejectButton,
                  isSubmitting && styles.actionButtonDisabled,
                ]}
                onPress={() => animateDecision(false)}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <Text style={styles.actionButtonLabel}>
                  {t("assist.reject")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.acceptButton,
                  isSubmitting && styles.actionButtonDisabled,
                ]}
                onPress={() => animateDecision(true)}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <Text style={styles.actionButtonLabel}>
                  {t("assist.approve")}
                </Text>
              </TouchableOpacity>
            </View>

            {isSubmitting ? (
              <View style={styles.processingRow}>
                <ActivityIndicator size="small" color="#D4526E" />
                <Text style={styles.processingText}>
                  {t("assist.processing")}
                </Text>
              </View>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButtonText: {
    fontSize: 16,
    color: "#D4526E",
    fontWeight: "600",
  },
  header: {
    marginBottom: 30,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 28,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  stateText: {
    fontSize: 16,
    color: "#6A5749",
  },
  feedbackCard: {
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#A13F4F",
    marginBottom: 16,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#3F2A1F",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#6A5749",
    textAlign: "center",
    marginBottom: 20,
  },
  deckArea: {
    flex: 1,
    justifyContent: "center",
    minHeight: 460,
  },
  shadowCard: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 18,
    bottom: 18,
    borderRadius: 24,
  },
  songCardWrapper: {
    width: "100%",
  },
  songCard: {
    borderRadius: 24,
    overflow: "hidden",
  },
  imageFrame: {
    position: "relative",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
    minHeight: 320,
    backgroundColor: "#EEDFCB",
  },
  albumArt: {
    width: "100%",
    height: 320,
  },
  albumArtFallback: {
    height: 320,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#EBD7BE",
  },
  albumArtFallbackEmoji: {
    fontSize: 42,
    marginBottom: 12,
  },
  albumArtFallbackText: {
    fontSize: 16,
    color: "#6A5749",
    textAlign: "center",
  },
  decisionBadge: {
    position: "absolute",
    top: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 3,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  rejectBadge: {
    left: 18,
    borderColor: "#BF5A4D",
    transform: [{ rotate: "-12deg" }],
  },
  acceptBadge: {
    right: 18,
    borderColor: "#5C9A65",
    transform: [{ rotate: "12deg" }],
  },
  decisionBadgeText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#3F2A1F",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  songMeta: {
    gap: 8,
  },
  songName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#2B1D16",
  },
  songArtist: {
    fontSize: 20,
    fontWeight: "700",
    color: "#7D5260",
  },
  songAlbum: {
    fontSize: 16,
    color: "#6A5749",
  },
  supportingText: {
    fontSize: 14,
    color: "#7A6A5B",
  },
  dragHint: {
    textAlign: "center",
    fontSize: 14,
    color: "#6A5749",
    marginTop: 12,
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 14,
  },
  actionButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 4,
  },
  rejectButton: {
    backgroundColor: "#BF5A4D",
  },
  acceptButton: {
    backgroundColor: "#5C9A65",
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFF9F3",
  },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
  },
  processingText: {
    fontSize: 14,
    color: "#6A5749",
  },
});
