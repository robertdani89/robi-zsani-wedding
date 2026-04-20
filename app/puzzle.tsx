import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  PUZZLE_COLLECTION_ID,
  PUZZLE_COLLECTION_NAME,
} from "@/services/constants";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { GalleryPhoto } from "@/types";
import { StatusBar } from "expo-status-bar";
import apiService from "@/services/api";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";

const GRID_SIZE = 3;
const EMPTY_TILE = GRID_SIZE * GRID_SIZE - 1;

const createSolvedBoard = (): number[] =>
  Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => index);

const isSolvedBoard = (board: number[]): boolean =>
  board.every((tile, index) => tile === index);

const isBoardSolvable = (board: number[]): boolean => {
  const tiles = board.filter((tile) => tile !== EMPTY_TILE);
  let inversions = 0;

  for (let i = 0; i < tiles.length; i += 1) {
    for (let j = i + 1; j < tiles.length; j += 1) {
      if (tiles[i] > tiles[j]) {
        inversions += 1;
      }
    }
  }

  return inversions % 2 === 0;
};

const createShuffledBoard = (): number[] => {
  const board = createSolvedBoard();

  do {
    for (let i = board.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [board[i], board[j]] = [board[j], board[i]];
    }
  } while (!isBoardSolvable(board) || isSolvedBoard(board));

  return [...board];
};

const areAdjacent = (firstIndex: number, secondIndex: number): boolean => {
  const firstRow = Math.floor(firstIndex / GRID_SIZE);
  const firstColumn = firstIndex % GRID_SIZE;
  const secondRow = Math.floor(secondIndex / GRID_SIZE);
  const secondColumn = secondIndex % GRID_SIZE;

  return (
    Math.abs(firstRow - secondRow) + Math.abs(firstColumn - secondColumn) === 1
  );
};

const getTileCoordinates = (index: number, size: number) => ({
  x: (index % GRID_SIZE) * size,
  y: Math.floor(index / GRID_SIZE) * size,
});

export default function PuzzleScreen() {
  const router = useRouter();
  const { t } = useLocalization();
  const { width } = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(true);
  const [puzzlePhotos, setPuzzlePhotos] = useState<GalleryPhoto[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [moves, setMoves] = useState(0);
  const [board, setBoard] = useState<number[]>(() => createShuffledBoard());
  const [isSolved, setIsSolved] = useState(false);

  const selectedPhoto = puzzlePhotos[currentPhotoIndex] ?? null;
  const boardSize = Math.min(width - 56, 330);
  const tileSize = boardSize / GRID_SIZE;
  const tileAnimationsRef = useRef<Record<number, Animated.ValueXY>>({});
  const tileScaleRef = useRef<Record<number, Animated.Value>>({});

  const getTileScaleValue = useCallback((tile: number) => {
    const existingValue = tileScaleRef.current[tile];
    if (existingValue) {
      return existingValue;
    }

    const nextValue = new Animated.Value(1);
    tileScaleRef.current[tile] = nextValue;
    return nextValue;
  }, []);

  const getTilePositionValue = useCallback(
    (tile: number) => {
      const existingValue = tileAnimationsRef.current[tile];
      if (existingValue) {
        return existingValue;
      }

      const initialIndex = board.indexOf(tile);
      const { x, y } = getTileCoordinates(initialIndex, tileSize);
      const nextValue = new Animated.ValueXY({ x, y });
      tileAnimationsRef.current[tile] = nextValue;
      return nextValue;
    },
    [board, tileSize],
  );

  const resetPuzzle = useCallback(() => {
    setBoard(createShuffledBoard());
    setMoves(0);
    setIsSolved(false);
  }, []);

  const loadPuzzlePhotos = useCallback(async () => {
    setIsLoading(true);

    try {
      const photos =
        await apiService.getGalleryCollectionPhotos(PUZZLE_COLLECTION_ID);

      setPuzzlePhotos(photos);
      setCurrentPhotoIndex(
        photos.length > 1 ? Math.floor(Math.random() * photos.length) : 0,
      );
    } catch (error) {
      console.error("Puzzle library error:", error);
      Alert.alert(
        t("questions.errorTitle"),
        t("identify.connectionErrorMessage"),
      );
      setPuzzlePhotos([]);
      setCurrentPhotoIndex(0);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadPuzzlePhotos();
  }, [loadPuzzlePhotos]);

  useEffect(() => {
    if (selectedPhoto) {
      resetPuzzle();
    }
  }, [resetPuzzle, selectedPhoto]);

  useEffect(() => {
    createSolvedBoard()
      .slice(0, EMPTY_TILE)
      .forEach((tile) => {
        const currentIndex = board.indexOf(tile);
        const { x, y } = getTileCoordinates(currentIndex, tileSize);
        const tilePosition = getTilePositionValue(tile);

        tilePosition.stopAnimation();
        Animated.spring(tilePosition, {
          toValue: { x, y },
          useNativeDriver: false,
          speed: 18,
          bounciness: 6,
        }).start();
      });
  }, [board, getTilePositionValue, tileSize]);

  const handleTilePress = useCallback(
    (tile: number) => {
      if (isSolved || tile === EMPTY_TILE) {
        return;
      }

      setBoard((currentBoard) => {
        const pressedIndex = currentBoard.indexOf(tile);
        const emptyIndex = currentBoard.indexOf(EMPTY_TILE);

        if (pressedIndex === -1 || !areAdjacent(pressedIndex, emptyIndex)) {
          return currentBoard;
        }

        const movingTileScale = getTileScaleValue(tile);
        movingTileScale.stopAnimation();

        const nextBoard = [...currentBoard];
        [nextBoard[pressedIndex], nextBoard[emptyIndex]] = [
          nextBoard[emptyIndex],
          nextBoard[pressedIndex],
        ];

        Animated.sequence([
          Animated.timing(movingTileScale, {
            toValue: 1.08,
            duration: 90,
            useNativeDriver: true,
          }),
          Animated.spring(movingTileScale, {
            toValue: 1,
            friction: 4,
            tension: 140,
            useNativeDriver: true,
          }),
        ]).start();

        setMoves((prev) => prev + 1);
        setIsSolved(isSolvedBoard(nextBoard));

        return nextBoard;
      });
    },
    [getTileScaleValue, isSolved],
  );

  const nextPhoto = () => {
    if (puzzlePhotos.length <= 1) {
      resetPuzzle();
      return;
    }

    setCurrentPhotoIndex((prev) => (prev + 1) % puzzlePhotos.length);
  };

  const tileElements = useMemo(() => {
    if (!selectedPhoto) {
      return null;
    }

    const emptyIndex = board.indexOf(EMPTY_TILE);
    const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
    const emptyColumn = emptyIndex % GRID_SIZE;

    return (
      <>
        <View
          style={[
            styles.tile,
            styles.emptyTile,
            {
              width: tileSize,
              height: tileSize,
              left: emptyColumn * tileSize,
              top: emptyRow * tileSize,
            },
          ]}
        >
          <Text style={styles.emptyTileText}>♡</Text>
        </View>

        {createSolvedBoard()
          .slice(0, EMPTY_TILE)
          .map((tile) => {
            const imageRow = Math.floor(tile / GRID_SIZE);
            const imageColumn = tile % GRID_SIZE;
            const animatedPosition = getTilePositionValue(tile);
            const animatedScale = getTileScaleValue(tile);

            return (
              <Animated.View
                key={`tile-${tile}`}
                style={[
                  styles.tile,
                  {
                    width: tileSize,
                    height: tileSize,
                    left: animatedPosition.x,
                    top: animatedPosition.y,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.animatedTileContent,
                    { transform: [{ scale: animatedScale }] },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => handleTilePress(tile)}
                    activeOpacity={0.85}
                    style={styles.touchableTile}
                  >
                    <View style={styles.tileInner}>
                      <Image
                        source={{ uri: selectedPhoto.displayUrl }}
                        style={{
                          position: "absolute",
                          width: boardSize,
                          height: boardSize,
                          left: -imageColumn * tileSize,
                          top: -imageRow * tileSize,
                        }}
                        resizeMode="cover"
                      />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>
            );
          })}
      </>
    );
  }, [
    board,
    boardSize,
    getTilePositionValue,
    getTileScaleValue,
    selectedPhoto,
    tileSize,
  ]);

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

          <Text style={styles.title}>{t("puzzle.title")}</Text>
          <Text style={styles.subtitle}>{t("puzzle.subtitle")}</Text>
        </Card>

        {isLoading ? (
          <Card>
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#D4526E" />
              <Text style={styles.loadingText}>{t("puzzle.loading")}</Text>
            </View>
          </Card>
        ) : !selectedPhoto ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🧩</Text>
              <Text style={styles.emptyTitle}>{t("puzzle.noImagesTitle")}</Text>
              <Text style={styles.emptySubtitle}>
                {t("puzzle.noImagesSubtitle")}
              </Text>
              <Button
                title={t("gallery.tryAgain")}
                onPress={() => void loadPuzzlePhotos()}
                style={styles.actionButton}
              />
            </View>
          </Card>
        ) : (
          <>
            <Card style={styles.infoCard}>
              {/* <Text style={styles.infoLabel}>{t("puzzle.usePhotoFrom")}</Text>
              <Text style={styles.infoTitle}>{PUZZLE_COLLECTION_NAME}</Text> */}
              <Text style={styles.movesText}>
                {t("puzzle.moves", { count: moves })}
              </Text>

              {isSolved ? (
                <View style={styles.successBox}>
                  <Text style={styles.successTitle}>
                    {t("puzzle.completedTitle")}
                  </Text>
                  <Text style={styles.successSubtitle}>
                    {t("puzzle.completedSubtitle")}
                  </Text>
                </View>
              ) : null}

              <View style={styles.buttonRow}>
                <Button title={t("puzzle.shuffle")} onPress={resetPuzzle} />
                <Button title={t("puzzle.newPhoto")} onPress={nextPhoto} />
              </View>
            </Card>

            <Card>
              <View
                style={[styles.board, { width: boardSize, height: boardSize }]}
              >
                {tileElements}
              </View>
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
  actionButton: {
    marginTop: 16,
    alignSelf: "stretch",
  },
  infoCard: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 13,
    color: "#7D5260",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  movesText: {
    fontSize: 15,
    color: "#A0522D",
    fontWeight: "600",
    marginBottom: 14,
  },
  successBox: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#E8F5E9",
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#2E7D32",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  board: {
    alignSelf: "center",
    position: "relative",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#EBC8D2",
  },
  tile: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: 1,
  },
  animatedTileContent: {
    flex: 1,
  },
  touchableTile: {
    flex: 1,
  },
  tileInner: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#FFF5F7",
  },
  emptyTile: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTileText: {
    fontSize: 24,
    color: "#A86C79",
  },
});
