/**
 * Utility functions for the Wedding App
 */

import { Answer, Photo, Question } from "@/types";

type Locale = "en" | "hu";

const getLocaleTag = (locale: Locale): string =>
  locale === "hu" ? "hu-HU" : "en-US";

/**
 * Format date to readable string
 */
export const formatDate = (
  dateString: string,
  locale: Locale = "hu",
): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(getLocaleTag(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format time to readable string
 */
export const formatTime = (
  dateString: string,
  locale: Locale = "hu",
): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString(getLocaleTag(locale), {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get answer display value
 */
export const getAnswerDisplay = (answer: Answer): string => {
  if (Array.isArray(answer.value)) {
    return answer.value.join(", ");
  }
  return answer.value;
};

/**
 * Calculate completion percentage
 */
export const calculateProgress = (
  answeredCount: number,
  totalQuestions: number,
  uploadedPhotos: number,
  requiredPhotos: number,
): number => {
  const questionProgress = Math.min((answeredCount / totalQuestions) * 50, 50);
  const photoProgress = Math.min((uploadedPhotos / requiredPhotos) * 50, 50);
  return Math.round(questionProgress + photoProgress);
};

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Get question by ID
 */
export const findQuestionById = (
  questions: Question[],
  questionId: string,
): Question | undefined => {
  return questions.find((q) => q.id === questionId);
};

/**
 * Check if all questions are answered
 */
export const areQuestionsComplete = (
  answers: Answer[],
  minRequired: number,
): boolean => {
  return answers.length >= minRequired;
};

/**
 * Check if photos requirement is met
 */
export const arePhotosComplete = (
  photos: Photo[],
  minRequired: number,
): boolean => {
  return photos.length >= minRequired;
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate guest name
 */
export const isValidGuestName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 50;
};

/**
 * Get progress color based on percentage
 */
export const getProgressColor = (percentage: number): string => {
  if (percentage === 100) return "#4CAF50"; // Green
  if (percentage >= 50) return "#FF9800"; // Orange
  return "#F44336"; // Red
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};
