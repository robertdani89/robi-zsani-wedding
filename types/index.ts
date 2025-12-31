export interface Guest {
  id: string;
  name: string;
  invitationCode?: string;
  completed: boolean;
  createdAt: string;
}

export enum QuestionType {
  SINGLE_CHOICE = "single_choice",
  MULTIPLE_CHOICE = "multiple_choice",
  FREE_TEXT = "free_text",
}

export enum QuestionCategory {
  TRAVEL = "Travel & Vacation",
  ACTIVITIES = "Activities & Hobbies",
  FUN = "Fun / Personal",
}

export interface Question {
  id: string;
  category: QuestionCategory;
  text: string;
  type: QuestionType;
  options?: string[];
}

export interface Answer {
  id: string;
  guestId: string;
  questionId: string;
  value: string | string[];
  answeredAt: string;
}

export interface Photo {
  id: string;
  guestId: string;
  uri: string;
  uploadedAt: string;
}

export interface AppState {
  guest: Guest | null;
  answers: Answer[];
  photos: Photo[];
  completedQuestions: Set<string>;
}

export interface TaskStatus {
  questionsCompleted: boolean;
  photosUploaded: boolean;
  allTasksCompleted: boolean;
  progressPercentage: number;
}
