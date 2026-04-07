import {
  Answer,
  GalleryCollection,
  GalleryPhoto,
  Guest,
  Photo,
  Question,
  QuestionType,
  Song,
} from "@/types";

import { Platform } from "react-native";

const getBaseUrl = () => {
  if (Platform.OS === "web") {
    return "http://localhost:8096/api";
  }

  return "https://homeharmonyhub.hu/api";
  // return "http://192.168.0.232:8096/api";
};

const API_BASE_URL = getBaseUrl();

const RETRY_COUNT = 3;
const RETRY_DELAY_MS = 700;
const REQUEST_TIMEOUT_MS = 2500;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isServerReachable = async (): Promise<boolean> => {
  for (let attempt = 1; attempt <= RETRY_COUNT; attempt += 1) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const response = await fetch(`${API_BASE_URL}/questions`, {
        method: "GET",
        signal: controller.signal,
      });

      if (response.ok) {
        return true;
      }
    } catch {
      // Retry on network errors and timeouts.
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }

    if (attempt < RETRY_COUNT) {
      await delay(RETRY_DELAY_MS);
    }
  }

  return false;
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    text: {
      en: "What kind of trip would you like to join us on?",
      hu: "Milyen kirándulásra jönnél velünk szívesen?",
    },
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      {
        en: "Beach",
        hu: "Strandolás",
      },
      {
        en: "Mountain retreat",
        hu: "Hegyi visszavonulás",
      },
      {
        en: "Biking tour",
        hu: "Biciklis túra",
      },
      {
        en: "Wine tasting tour",
        hu: "Borkóstoló kúra",
      },
    ],
  },
  {
    id: "q2",
    text: {
      en: "What kind of evening program would you like to join us for?",
      hu: "Milyen esti programra csatlakoznál hozzánk szívesen?",
    },
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      {
        en: "Board game night",
        hu: "Társasjáték est",
      },
      {
        en: "Movie night",
        hu: "Filmnézés",
      },
      {
        en: "Theater",
        hu: "Színház",
      },
      {
        en: "Concert",
        hu: "Koncert",
      },
    ],
  },
  {
    id: "q3",
    text: {
      en: "Would you guess a boy or a girl for our first baby?",
      hu: "Fiút vagy lányt tippelnél nekünk első babára?",
    },
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        en: "Boy",
        hu: "Fiú",
      },
      {
        en: "Girl",
        hu: "Lány",
      },
      {
        en: "Stick with the dogs!",
        hu: "Maradjatok a kutyáknál!",
      },
    ],
  },

  {
    id: "q4",
    text: {
      en: "Share a piece of advice for marriage or parenthood!",
      hu: "Ossz meg velünk egy jó tanácsot a házassághoz vagy a szülői léthez!",
    },
    type: QuestionType.FREE_TEXT,
  },
];

const MOCK_GALLERY_COLLECTIONS: GalleryCollection[] = [
  {
    id: "preparations",
    title: "Preparations",
    description: "Making the rings and gifts.",
    thumbnailUrl: "https://picsum.photos/seed/preparations/900/600",
    photoCount: 5,
  },
  {
    id: "the-couple",
    title: "The couple",
    description: "Our special moments together.",
    thumbnailUrl: "https://picsum.photos/seed/the-couple/900/600",
    photoCount: 5,
  },
  {
    id: "our-little-pets",
    title: "Our little pets",
    description:
      "Meet our beloved dogs, who are part of our family and often steal the spotlight!",
    thumbnailUrl: "https://picsum.photos/seed/our-little-pets/900/600",
    photoCount: 5,
  },
];

const buildMockGalleryPhotos = (collectionId: string): GalleryPhoto[] =>
  Array.from({ length: 5 }, (_, index) => {
    const photoNumber = index + 1;
    const seed = `${collectionId}-${photoNumber}`;

    return {
      id: `${collectionId}-${photoNumber}`,
      collectionId,
      title: `Photo ${photoNumber}`,
      thumbnailUrl: `https://picsum.photos/seed/${seed}/240/180`,
      displayUrl: `https://picsum.photos/seed/${seed}/1400/1000`,
      fullUrl: `https://picsum.photos/seed/${seed}/2000/1400`,
    };
  });

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
    value: Answer["value"],
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

  async getGalleryCollections(): Promise<GalleryCollection[]> {
    await this.delay();
    return MOCK_GALLERY_COLLECTIONS;
  }

  async getGalleryCollectionPhotos(
    collectionId: string,
  ): Promise<GalleryPhoto[]> {
    await this.delay();
    const selectedCollection =
      MOCK_GALLERY_COLLECTIONS.find(
        (collection) => collection.id === collectionId,
      )?.id ?? MOCK_GALLERY_COLLECTIONS[0].id;

    return buildMockGalleryPhotos(selectedCollection);
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
    value: Answer["value"],
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

  private async fetchGalleryData<T>(endpoints: string[]): Promise<T> {
    let lastError: unknown;

    for (const endpoint of endpoints) {
      try {
        return await this.fetch<T>(endpoint);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Gallery endpoint not available.");
  }

  private normalizeGalleryCollection(item: any): GalleryCollection {
    return {
      id: String(
        item.id ?? item.slug ?? item.collectionId ?? item.name ?? Date.now(),
      ),
      title: String(item.title ?? item.name ?? item.label ?? "Gallery"),
      description: item.description ? String(item.description) : undefined,
      thumbnailUrl:
        item.thumbnailUrl ??
        item.coverPhotoUrl ??
        item.coverUrl ??
        item.thumbnail ??
        item.cover ??
        undefined,
      googlePhotosUrl:
        item.googlePhotosUrl ?? item.externalUrl ?? item.shareUrl ?? undefined,
      photoCount:
        typeof item.photoCount === "number"
          ? item.photoCount
          : Array.isArray(item.photos)
            ? item.photos.length
            : undefined,
    };
  }

  private normalizeGalleryPhoto(item: any, collectionId: string): GalleryPhoto {
    const thumbnailUrl =
      item.thumbnailUrl ?? item.thumbnail ?? item.previewUrl ?? item.url;
    const displayUrl =
      item.displayUrl ?? item.mediumUrl ?? item.previewUrl ?? item.url;

    return {
      id: String(
        item.id ??
          item.photoId ??
          item.filename ??
          `${collectionId}-${Date.now()}`,
      ),
      collectionId,
      title: item.title ? String(item.title) : undefined,
      thumbnailUrl: String(thumbnailUrl),
      displayUrl: String(displayUrl),
      fullUrl: item.fullUrl ?? item.originalUrl ?? item.url ?? undefined,
    };
  }

  async getGalleryCollections(): Promise<GalleryCollection[]> {
    const data: any = await this.fetchGalleryData([
      "/gallery/collections",
      "/galleries",
      "/photos/collections",
    ]);

    const collections = Array.isArray(data)
      ? data
      : Array.isArray(data?.collections)
        ? data.collections
        : Array.isArray(data?.items)
          ? data.items
          : [];

    return collections.map((item: any) =>
      this.normalizeGalleryCollection(item),
    );
  }

  async getGalleryCollectionPhotos(
    collectionId: string,
  ): Promise<GalleryPhoto[]> {
    const data: any = await this.fetchGalleryData([
      `/gallery/collections/${encodeURIComponent(collectionId)}/photos`,
      `/galleries/${encodeURIComponent(collectionId)}/photos`,
      `/photos/collections/${encodeURIComponent(collectionId)}`,
    ]);

    const photos = Array.isArray(data)
      ? data
      : Array.isArray(data?.photos)
        ? data.photos
        : Array.isArray(data?.items)
          ? data.items
          : [];

    return photos.map((item: any) =>
      this.normalizeGalleryPhoto(item, collectionId),
    );
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

class SmartApiService {
  private readonly api = new ApiService();
  private readonly mock = new MockApiService();
  private resolvedService: ApiService | MockApiService | null = null;
  private resolvePromise: Promise<ApiService | MockApiService> | null = null;

  constructor() {
    void this.getService();
  }

  private async getService(): Promise<ApiService | MockApiService> {
    if (this.resolvedService) {
      return this.resolvedService;
    }

    if (!this.resolvePromise) {
      this.resolvePromise = (async () => {
        const reachable = await isServerReachable();
        this.resolvedService = reachable ? this.api : this.mock;
        return this.resolvedService;
      })();
    }

    return this.resolvePromise;
  }

  async registerGuest(
    name: string,
    questionCount: number = 8,
  ): Promise<RegisterResponse> {
    const service = await this.getService();
    return service.registerGuest(name, questionCount);
  }

  async getGuest(guestId: string): Promise<Guest> {
    const service = await this.getService();
    return service.getGuest(guestId);
  }

  async updateGuest(
    guestId: string,
    payload: UpdateGuestPayload,
  ): Promise<Guest> {
    const service = await this.getService();
    return service.updateGuest(guestId, payload);
  }

  async getGuestQuestions(guestId: string): Promise<Question[]> {
    const service = await this.getService();
    return service.getGuestQuestions(guestId);
  }

  async getAllQuestions(): Promise<Question[]> {
    const service = await this.getService();
    return service.getAllQuestions();
  }

  async getRandomQuestions(count: number = 8): Promise<Question[]> {
    const service = await this.getService();
    return service.getRandomQuestions(count);
  }

  async submitAnswer(
    guestId: string,
    questionId: string,
    value: Answer["value"],
  ): Promise<Answer> {
    const service = await this.getService();
    return service.submitAnswer(guestId, questionId, value);
  }

  async getGuestAnswers(guestId: string): Promise<Answer[]> {
    const service = await this.getService();
    return service.getGuestAnswers(guestId);
  }

  async uploadPhoto(
    guestId: string,
    photoUri: string,
  ): Promise<UploadPhotoResponse> {
    const service = await this.getService();
    return service.uploadPhoto(guestId, photoUri);
  }

  async getGuestPhotos(guestId: string): Promise<Photo[]> {
    const service = await this.getService();
    return service.getGuestPhotos(guestId);
  }

  async deletePhoto(photoId: string): Promise<void> {
    const service = await this.getService();
    return service.deletePhoto(photoId);
  }

  getPhotoUrl(photoId: string): string {
    if (this.resolvedService) {
      return this.resolvedService.getPhotoUrl(photoId);
    }

    return this.api.getPhotoUrl(photoId);
  }

  getPhotoThumbnailUrl(photoId: string): string {
    if (this.resolvedService) {
      return this.resolvedService.getPhotoThumbnailUrl(photoId);
    }

    return this.api.getPhotoThumbnailUrl(photoId);
  }

  async getGalleryCollections(): Promise<GalleryCollection[]> {
    const service = await this.getService();

    try {
      return await service.getGalleryCollections();
    } catch (error) {
      console.warn("Falling back to mock gallery collections:", error);
      return this.mock.getGalleryCollections();
    }
  }

  async getGalleryCollectionPhotos(
    collectionId: string,
  ): Promise<GalleryPhoto[]> {
    const service = await this.getService();

    try {
      return await service.getGalleryCollectionPhotos(collectionId);
    } catch (error) {
      console.warn("Falling back to mock gallery photos:", error);
      return this.mock.getGalleryCollectionPhotos(collectionId);
    }
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
    const service = await this.getService();
    return service.getAllGuestsWithStats();
  }

  async getGuestAnswersWithQuestions(
    guestId: string,
  ): Promise<(Answer & { question?: Question })[]> {
    const service = await this.getService();
    return service.getGuestAnswersWithQuestions(guestId);
  }

  async searchSongs(query: string): Promise<SpotifySearchResult[]> {
    const service = await this.getService();
    return service.searchSongs(query);
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
    const service = await this.getService();
    return service.selectSong(songData);
  }

  async getGuestSong(guestId: string): Promise<Song | null> {
    const service = await this.getService();
    return service.getGuestSong(guestId);
  }

  async deleteSong(songId: string): Promise<void> {
    const service = await this.getService();
    return service.deleteSong(songId);
  }
}

export const apiService = new SmartApiService();
export default apiService;
