import {
  Answer,
  AppState,
  Guest,
  Photo,
  Question,
  Song,
  TaskStatus,
} from "@/types";
import { MIN_PHOTOS_REQUIRED, MIN_QUESTIONS_TO_ANSWER } from "@/data/questions";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

interface AppContextType {
  state: AppState;
  isHydrated: boolean;
  setGuest: (guest: Guest) => Promise<void>;
  addAnswer: (answer: Answer) => Promise<void>;
  addPhoto: (photo: Photo) => Promise<void>;
  removePhoto: (photoId: string) => Promise<void>;
  setSong: (song: Song | null) => Promise<void>;
  markAsCompleted: () => Promise<void>;
  getTaskStatus: () => TaskStatus;
  resetApp: () => Promise<void>;
  setAssignedQuestions: (questions: Question[]) => Promise<void>;
  getAssignedQuestions: () => Question[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  GUEST: "@wedding_app_guest",
  ANSWERS: "@wedding_app_answers",
  PHOTOS: "@wedding_app_photos",
  QUESTIONS: "@wedding_app_questions",
  SONG: "@wedding_app_song",
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>({
    guest: null,
    answers: [],
    photos: [],
    song: [],
    completedQuestions: new Set(),
  });
  const [isHydrated, setIsHydrated] = useState(false);

  const [assignedQuestions, setAssignedQuestionsState] = useState<Question[]>(
    [],
  );

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [guestData, answersData, photosData, questionsData, songData] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.GUEST),
          AsyncStorage.getItem(STORAGE_KEYS.ANSWERS),
          AsyncStorage.getItem(STORAGE_KEYS.PHOTOS),
          AsyncStorage.getItem(STORAGE_KEYS.QUESTIONS),
          AsyncStorage.getItem(STORAGE_KEYS.SONG),
        ]);

      const guest = guestData ? JSON.parse(guestData) : null;
      const answers = answersData ? JSON.parse(answersData) : [];
      const photos = photosData ? JSON.parse(photosData) : [];
      const questions = questionsData ? JSON.parse(questionsData) : [];
      const parsedSong = songData ? JSON.parse(songData) : [];
      // Backward compatibility: migrate persisted single-song value to list.
      const song = Array.isArray(parsedSong)
        ? parsedSong
        : parsedSong
          ? [parsedSong]
          : [];

      setState({
        guest,
        answers,
        photos,
        song,
        completedQuestions: new Set(answers.map((a: Answer) => a.questionId)),
      });

      setAssignedQuestionsState(questions);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsHydrated(true);
    }
  };

  const setGuest = async (guest: Guest) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GUEST, JSON.stringify(guest));
      setState((prev) => ({ ...prev, guest }));
    } catch (error) {
      console.error("Error saving guest:", error);
    }
  };

  const addAnswer = async (answer: Answer) => {
    try {
      const updatedAnswers = [
        ...state.answers.filter((a) => a.questionId !== answer.questionId),
        answer,
      ];
      await AsyncStorage.setItem(
        STORAGE_KEYS.ANSWERS,
        JSON.stringify(updatedAnswers),
      );

      setState((prev) => ({
        ...prev,
        answers: updatedAnswers,
        completedQuestions: new Set([
          ...prev.completedQuestions,
          answer.questionId,
        ]),
      }));
    } catch (error) {
      console.error("Error saving answer:", error);
    }
  };

  const addPhoto = async (photo: Photo) => {
    try {
      const updatedPhotos = [...state.photos, photo];
      await AsyncStorage.setItem(
        STORAGE_KEYS.PHOTOS,
        JSON.stringify(updatedPhotos),
      );
      setState((prev) => ({ ...prev, photos: updatedPhotos }));
    } catch (error) {
      console.error("Error saving photo:", error);
    }
  };

  const removePhoto = async (photoId: string) => {
    try {
      const updatedPhotos = state.photos.filter((p) => p.id !== photoId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.PHOTOS,
        JSON.stringify(updatedPhotos),
      );
      setState((prev) => ({ ...prev, photos: updatedPhotos }));
    } catch (error) {
      console.error("Error removing photo:", error);
    }
  };

  const markAsCompleted = async () => {
    if (state.guest) {
      const updatedGuest = { ...state.guest, completed: true };
      await setGuest(updatedGuest);
    }
  };

  const setSong = async (song: Song | null) => {
    try {
      if (song) {
        const updatedSongs = [...state.song, song];
        await AsyncStorage.setItem(
          STORAGE_KEYS.SONG,
          JSON.stringify(updatedSongs),
        );
        setState((prev) => ({ ...prev, song: updatedSongs }));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.SONG);
        setState((prev) => ({ ...prev, song: [] }));
      }
    } catch (error) {
      console.error("Error saving song:", error);
    }
  };

  const getTaskStatus = (): TaskStatus => {
    const questionsCompleted = state.answers.length >= MIN_QUESTIONS_TO_ANSWER;
    const photosUploaded = state.photos.length >= MIN_PHOTOS_REQUIRED;
    const songSelected = state.song.length > 0;
    const allTasksCompleted =
      questionsCompleted && photosUploaded && songSelected;

    // Now 3 tasks: questions 33%, photos 33%, song 34%
    const questionProgress = Math.min(
      (state.answers.length / MIN_QUESTIONS_TO_ANSWER) * 33,
      33,
    );
    const photoProgress = Math.min(
      (state.photos.length / MIN_PHOTOS_REQUIRED) * 33,
      33,
    );
    const songProgress = songSelected ? 34 : 0;
    const progressPercentage = Math.round(
      questionProgress + photoProgress + songProgress,
    );

    return {
      questionsCompleted,
      photosUploaded,
      songSelected,
      allTasksCompleted,
      progressPercentage,
    };
  };

  const setAssignedQuestions = async (questions: Question[]) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.QUESTIONS,
        JSON.stringify(questions),
      );
      setAssignedQuestionsState(questions);
    } catch (error) {
      console.error("Error saving questions:", error);
    }
  };

  const getAssignedQuestions = (): Question[] => {
    return assignedQuestions;
  };

  const resetApp = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.GUEST,
        STORAGE_KEYS.ANSWERS,
        STORAGE_KEYS.PHOTOS,
        STORAGE_KEYS.QUESTIONS,
        STORAGE_KEYS.SONG,
      ]);
      setState({
        guest: null,
        answers: [],
        photos: [],
        song: [],
        completedQuestions: new Set(),
      });
      setAssignedQuestionsState([]);
    } catch (error) {
      console.error("Error resetting app:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        isHydrated,
        setGuest,
        addAnswer,
        addPhoto,
        removePhoto,
        setSong,
        markAsCompleted,
        getTaskStatus,
        resetApp,
        setAssignedQuestions,
        getAssignedQuestions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
