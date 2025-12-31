import { Answer, AppState, Guest, Photo, Question, TaskStatus } from "@/types";
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
  setGuest: (guest: Guest) => Promise<void>;
  addAnswer: (answer: Answer) => Promise<void>;
  addPhoto: (photo: Photo) => Promise<void>;
  removePhoto: (photoId: string) => Promise<void>;
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
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>({
    guest: null,
    answers: [],
    photos: [],
    completedQuestions: new Set(),
  });

  const [assignedQuestions, setAssignedQuestionsState] = useState<Question[]>(
    []
  );

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [guestData, answersData, photosData, questionsData] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.GUEST),
          AsyncStorage.getItem(STORAGE_KEYS.ANSWERS),
          AsyncStorage.getItem(STORAGE_KEYS.PHOTOS),
          AsyncStorage.getItem(STORAGE_KEYS.QUESTIONS),
        ]);

      const guest = guestData ? JSON.parse(guestData) : null;
      const answers = answersData ? JSON.parse(answersData) : [];
      const photos = photosData ? JSON.parse(photosData) : [];
      const questions = questionsData ? JSON.parse(questionsData) : [];

      setState({
        guest,
        answers,
        photos,
        completedQuestions: new Set(answers.map((a: Answer) => a.questionId)),
      });

      setAssignedQuestionsState(questions);
    } catch (error) {
      console.error("Error loading data:", error);
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
        JSON.stringify(updatedAnswers)
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
        JSON.stringify(updatedPhotos)
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
        JSON.stringify(updatedPhotos)
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

  const getTaskStatus = (): TaskStatus => {
    const questionsCompleted = state.answers.length >= MIN_QUESTIONS_TO_ANSWER;
    const photosUploaded = state.photos.length >= MIN_PHOTOS_REQUIRED;
    const allTasksCompleted = questionsCompleted && photosUploaded;

    const questionProgress = Math.min(
      (state.answers.length / MIN_QUESTIONS_TO_ANSWER) * 50,
      50
    );
    const photoProgress = Math.min(
      (state.photos.length / MIN_PHOTOS_REQUIRED) * 50,
      50
    );
    const progressPercentage = Math.round(questionProgress + photoProgress);

    return {
      questionsCompleted,
      photosUploaded,
      allTasksCompleted,
      progressPercentage,
    };
  };

  const setAssignedQuestions = async (questions: Question[]) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.QUESTIONS,
        JSON.stringify(questions)
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
      ]);
      setState({
        guest: null,
        answers: [],
        photos: [],
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
        setGuest,
        addAnswer,
        addPhoto,
        removePhoto,
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
