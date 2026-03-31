import { Answer, Guest, Photo, Question, QuestionType, Song } from "@/types";

import { Platform } from "react-native";

const today = new Date();
const IS_MOCK_MODE = !(
  today.getFullYear() === 2026 &&
  today.getMonth() === 4 &&
  today.getDate() === 2
);

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "Milyen kirándulásra jönnél velünk szívesen?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      "Strandolás",
      "Hegyi visszavonulás",
      "Biciklis túra",
      "Borkóstoló kúra",
    ],
  },
  {
    id: "q2",
    text: "Milyen esti programra csatlakoznál hozzánk szívesen?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["Társasjáték est", "Filmnézés", "Színház", "Koncert"],
  },
  {
    id: "q3",
    text: "Fiút vagy lányt tippelnél nekünk első babára?",
    type: QuestionType.SINGLE_CHOICE,
    options: ["Fiú", "Lány", "Maradjatok a kutyáknál!"],
  },

  {
    id: "q4",
    text: "Ossz meg velünk egy jó tanácsot a házassághoz vagy a szülői léthez!",
    type: QuestionType.FREE_TEXT,
  },
];

// ---------------------------------------------------------------------------
// MockApiService
// ---------------------------------------------------------------------------

class MockApiService {
  private guests: Map<string, Guest> = new Map();
  private answers: Answer[] = [];
  private songs: Map<string, Song> = new Map();

  private delay(ms = 400): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private makeGuest(id: string, name: string): Guest {
    return {
      id,
      name,
      completed: false,
      createdAt: new Date().toISOString(),
    };
  }

  async registerGuest(name: string, questionCount: number = 4) {
    await this.delay();
    const id = `mock-${Date.now()}`;
    const guest = this.makeGuest(id, name);
    this.guests.set(id, guest);
    const questions = QUESTIONS.slice(0, questionCount);
    return { guest, questions };
  }

  async getGuest(guestId: string): Promise<Guest> {
    await this.delay();
    return this.guests.get(guestId) ?? this.makeGuest(guestId, "Teszt Vendég");
  }

  async updateGuest(
    guestId: string,
    payload: UpdateGuestPayload,
  ): Promise<Guest> {
    await this.delay();
    const existing =
      this.guests.get(guestId) ?? this.makeGuest(guestId, "Teszt Vendég");
    const updated: Guest = { ...existing, ...payload };
    this.guests.set(guestId, updated);
    return updated;
  }

  async getGuestQuestions(guestId: string): Promise<Question[]> {
    await this.delay();
    return QUESTIONS;
  }

  async getAllQuestions(): Promise<Question[]> {
    await this.delay();
    return QUESTIONS;
  }

  async getRandomQuestions(count: number = 8): Promise<Question[]> {
    await this.delay();
    return QUESTIONS.slice(0, count);
  }

  async submitAnswer(
    guestId: string,
    questionId: string,
    value: string | string[],
  ): Promise<Answer> {
    await this.delay();
    this.answers = this.answers.filter(
      (a) => !(a.guestId === guestId && a.questionId === questionId),
    );
    const answer: Answer = {
      id: `mock-ans-${Date.now()}`,
      guestId,
      questionId,
      value,
      answeredAt: new Date().toISOString(),
    };
    this.answers.push(answer);
    return answer;
  }

  async getGuestAnswers(guestId: string): Promise<Answer[]> {
    await this.delay();
    return this.answers.filter((a) => a.guestId === guestId);
  }

  async uploadPhoto(
    guestId: string,
    _photoUri: string,
  ): Promise<UploadPhotoResponse> {
    await this.delay(800);
    const id = `mock-photo-${Date.now()}`;
    return {
      id,
      filename: `${id}.jpg`,
      path: `/mock/photos/${id}.jpg`,
      mimetype: "image/jpeg",
      size: 204800,
      guestId,
      createdAt: new Date().toISOString(),
    };
  }

  async getGuestPhotos(_guestId: string): Promise<Photo[]> {
    await this.delay();
    return [];
  }

  async deletePhoto(_photoId: string): Promise<void> {
    await this.delay();
  }

  getPhotoUrl(photoId: string): string {
    return `https://picsum.photos/seed/${photoId}/800/600`;
  }

  getPhotoThumbnailUrl(photoId: string): string {
    return `https://picsum.photos/seed/${photoId}/200/150`;
  }

  async getAllGuestsWithStats() {
    await this.delay();
    return Array.from(this.guests.values()).map((g) => ({
      id: g.id,
      name: g.name,
      createdAt: g.createdAt,
      answerCount: this.answers.filter((a) => a.guestId === g.id).length,
      photoCount: 0,
    }));
  }

  async getGuestAnswersWithQuestions(
    guestId: string,
  ): Promise<(Answer & { question?: Question })[]> {
    await this.delay();
    return this.answers
      .filter((a) => a.guestId === guestId)
      .map((a) => ({
        ...a,
        question: QUESTIONS.find((q) => q.id === a.questionId),
      }));
  }

  async searchSongs(query: string): Promise<SpotifySearchResult[]> {
    await this.delay(600);
    return [
      {
        spotifyId: "mock-spotify-1",
        name: `${query} – Mock Dal`,
        artist: "Mock Előadó",
        album: "Mock Album",
        albumArt: null,
        previewUrl: null,
      },
      {
        spotifyId: "mock-spotify-2",
        name: `${query} – Másik Dal`,
        artist: "Másik Előadó",
        album: "Másik Album",
        albumArt: null,
        previewUrl: null,
      },
    ];
  }

  async selectSong(songData: {
    spotifyId: string;
    name: string;
    artist: string;
    album: string;
    albumArt?: string;
    previewUrl?: string;
    guestId: string;
  }): Promise<Song> {
    await this.delay();
    const song: Song = {
      id: `mock-song-${Date.now()}`,
      spotifyId: songData.spotifyId,
      name: songData.name,
      artist: songData.artist,
      album: songData.album,
      albumArt: songData.albumArt,
      previewUrl: songData.previewUrl,
      selectedAt: new Date().toISOString(),
    };
    this.songs.set(songData.guestId, song);
    return song;
  }

  async getGuestSong(guestId: string): Promise<Song | null> {
    await this.delay();
    return this.songs.get(guestId) ?? null;
  }

  async deleteSong(songId: string): Promise<void> {
    await this.delay();
    for (const [guestId, song] of this.songs.entries()) {
      if (song.id === songId) {
        this.songs.delete(guestId);
        break;
      }
    }
  }
}

interface SpotifySearchResult {
  spotifyId: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string | null;
  previewUrl: string | null;
}

const getBaseUrl = () => {
  if (Platform.OS === "web") {
    return "http://localhost:8096/api";
  }

  return "https://homeharmonyhub.hu/api";
  // return "http://192.168.0.232:8096/api";
};

const API_BASE_URL = getBaseUrl();

interface RegisterResponse {
  guest: Guest;
  questions: Question[];
}

interface UpdateGuestPayload {
  gotGiftAt?: string;
  typeOfGift?: string;
  completed?: boolean;
}

interface UploadPhotoResponse {
  id: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  guestId: string;
  createdAt: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async registerGuest(
    name: string,
    questionCount: number = 8,
  ): Promise<RegisterResponse> {
    return this.fetch<RegisterResponse>(
      `/guests/register?questionCount=${questionCount}`,
      {
        method: "POST",
        body: JSON.stringify({ name }),
      },
    );
  }

  async getGuest(guestId: string): Promise<Guest> {
    return this.fetch<Guest>(`/guests/${guestId}`);
  }

  async updateGuest(
    guestId: string,
    payload: UpdateGuestPayload,
  ): Promise<Guest> {
    try {
      return await this.fetch<Guest>(`/guests/${guestId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    } catch (error) {
      return this.fetch<Guest>(`/guests/${guestId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    }
  }

  async getGuestQuestions(guestId: string): Promise<Question[]> {
    return this.fetch<Question[]>(`/guests/${guestId}/questions`);
  }

  async getAllQuestions(): Promise<Question[]> {
    return this.fetch<Question[]>("/questions");
  }

  async getRandomQuestions(count: number = 8): Promise<Question[]> {
    return this.fetch<Question[]>(`/questions/random?count=${count}`);
  }

  async submitAnswer(
    guestId: string,
    questionId: string,
    value: string | string[],
  ): Promise<Answer> {
    return this.fetch<Answer>("/answers", {
      method: "POST",
      body: JSON.stringify({
        guestId,
        questionId,
        value,
      }),
    });
  }

  async getGuestAnswers(guestId: string): Promise<Answer[]> {
    return this.fetch<Answer[]>(`/answers/guest/${guestId}`);
  }

  async uploadPhoto(
    guestId: string,
    photoUri: string,
  ): Promise<UploadPhotoResponse> {
    const formData = new FormData();

    const uriParts = photoUri.split("/");
    let fileName = uriParts[uriParts.length - 1];

    const isWeb =
      typeof window !== "undefined" && typeof window.document !== "undefined";

    if (isWeb) {
      const response = await fetch(photoUri);
      const blob = await response.blob();

      const blobMimeType = blob.type || "image/jpeg";

      let extension = "jpg";
      if (blobMimeType.includes("png")) {
        extension = "png";
      } else if (blobMimeType.includes("gif")) {
        extension = "gif";
      } else if (blobMimeType.includes("webp")) {
        extension = "webp";
      } else if (
        blobMimeType.includes("jpeg") ||
        blobMimeType.includes("jpg")
      ) {
        extension = "jpg";
      }

      const webFileName = `photo_${Date.now()}.${extension}`;
      formData.append("photo", blob, webFileName);
    } else {
      let extension = fileName.split(".").pop()?.toLowerCase();

      if (
        !extension ||
        !["jpg", "jpeg", "png", "gif", "webp", "heic", "heif"].includes(
          extension,
        )
      ) {
        extension = "jpg";
        fileName = `photo_${Date.now()}.jpg`;
      }

      let mimeType = "image/jpeg";
      if (extension === "png") {
        mimeType = "image/png";
      } else if (extension === "gif") {
        mimeType = "image/gif";
      } else if (extension === "webp") {
        mimeType = "image/webp";
      } else if (extension === "heic" || extension === "heif") {
        mimeType = "image/heic";
      }

      formData.append("photo", {
        uri: photoUri,
        name: fileName,
        type: mimeType,
      } as any);
    }

    formData.append("guestId", guestId);

    const response = await fetch(`${this.baseUrl}/photos/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async getGuestPhotos(guestId: string): Promise<Photo[]> {
    return this.fetch<Photo[]>(`/photos/guest/${guestId}`);
  }

  async deletePhoto(photoId: string): Promise<void> {
    await this.fetch(`/photos/${photoId}`, {
      method: "DELETE",
    });
  }

  getPhotoUrl(photoId: string): string {
    return `${this.baseUrl}/photos/${photoId}/file`;
  }

  getPhotoThumbnailUrl(photoId: string): string {
    return `${this.baseUrl}/photos/${photoId}/thumbnail`;
  }

  async getAllGuestsWithStats(): Promise<
    {
      id: string;
      name: string;
      createdAt: string;
      answerCount: number;
      photoCount: number;
    }[]
  > {
    return this.fetch("/admin/guests");
  }

  async getGuestAnswersWithQuestions(
    guestId: string,
  ): Promise<(Answer & { question?: Question })[]> {
    return this.fetch(`/answers/guest/${guestId}`);
  }

  // Song methods
  async searchSongs(query: string): Promise<SpotifySearchResult[]> {
    return this.fetch(`/songs/search?q=${encodeURIComponent(query)}`);
  }

  async selectSong(songData: {
    spotifyId: string;
    name: string;
    artist: string;
    album: string;
    albumArt?: string;
    previewUrl?: string;
    guestId: string;
  }): Promise<Song> {
    return this.fetch("/songs", {
      method: "POST",
      body: JSON.stringify(songData),
    });
  }

  async getGuestSong(guestId: string): Promise<Song | null> {
    return this.fetch(`/songs/guest/${guestId}`);
  }

  async deleteSong(songId: string): Promise<void> {
    await this.fetch(`/songs/${songId}`, {
      method: "DELETE",
    });
  }
}

export const apiService = IS_MOCK_MODE
  ? (new MockApiService() as unknown as ApiService)
  : new ApiService();
export default apiService;
