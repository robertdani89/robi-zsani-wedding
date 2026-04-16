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

export interface LocalizedString {
  en: string;
  hu: string;
}

export interface Question {
  id: string;
  text: LocalizedString;
  type: QuestionType;
  options?: LocalizedString[];
}

export interface Answer {
  id: string;
  guestId: string;
  questionId: string;
  value: string | number | number[];
  answeredAt: string;
}

export interface Photo {
  id: string;
  guestId: string;
  uri: string;
  uploadedAt: string;
  uploadFingerprint?: string;
}

export interface GalleryCollection {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  googlePhotosUrl?: string;
  photoCount?: number;
  hiddenFromGallery?: boolean;
}

export interface GalleryPhoto {
  id: string;
  collectionId: string;
  title?: string;
  thumbnailUrl: string;
  displayUrl: string;
  fullUrl?: string;
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
  song: Song[];
  completedQuestions: Set<string>;
}

export interface TaskStatus {
  questionsCompleted: boolean;
  photosUploaded: boolean;
  songSelected: boolean;
  allTasksCompleted: boolean;
  progressPercentage: number;
}

export interface SpotifySearchResult {
  spotifyId: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string | null;
  previewUrl: string | null;
}

export interface RegisterResponse {
  guest: Guest;
  questions: Question[];
}

export interface UpdateGuestPayload {
  gotGiftAt?: string;
  typeOfGift?: string;
  completed?: boolean;
}

export interface GiftAssistancePayload {
  requestedAt?: string;
  gotGiftAt?: string;
  typeOfGift?: string;
}

export interface UploadPhotoAsset {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  width?: number;
  height?: number;
}

export interface UploadPhotoResponse {
  id: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  guestId: string;
  createdAt: string;
}
