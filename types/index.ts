export interface Guest {
  id: string;
  name: string;
  invitationCode?: string;
  completed: boolean;
  createdAt: string;
  gotGiftAt?: string;
  typeOfGift?: string;
}

export enum QuestionType {
  SINGLE_CHOICE = "single_choice",
  MULTIPLE_CHOICE = "multiple_choice",
  FREE_TEXT = "free_text",
}

export interface Question {
  id: string;
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

export interface Song {
  id: string;
  spotifyId: string;
  name: string;
  artist: string;
  album: string;
  albumArt?: string;
  previewUrl?: string;
  selectedAt: string;
}

export interface AppState {
  guest: Guest | null;
  answers: Answer[];
  photos: Photo[];
  song: Song | null;
  completedQuestions: Set<string>;
}

export interface TaskStatus {
  questionsCompleted: boolean;
  photosUploaded: boolean;
  songSelected: boolean;
  allTasksCompleted: boolean;
  progressPercentage: number;
}
