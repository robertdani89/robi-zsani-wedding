import { Answer, Guest, Photo, Question, Song } from "@/types";

import { Platform } from "react-native";

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

export const apiService = new ApiService();
export default apiService;
