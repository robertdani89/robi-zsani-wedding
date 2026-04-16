import {
  Answer,
  GalleryCollection,
  GalleryPhoto,
  Guest,
  Photo,
  Question,
  Song,
  type GiftAssistancePayload,
  type RegisterResponse,
  type SpotifySearchResult,
  type UploadPhotoAsset,
  type UpdateGuestPayload,
  type UploadPhotoResponse,
} from "@/types";

import * as FileSystem from "expo-file-system/legacy";
import { SaveFormat, manipulateAsync } from "expo-image-manipulator";
import { NetworkStateType, getNetworkStateAsync } from "expo-network";
import { Platform } from "react-native";
import { PUZZLE_COLLECTION_ID } from "./constants";
import { MockApiService } from "./mock";

const getBaseUrl = () => {
  if (Platform.OS === "web") {
    return "http://localhost:8096/api";
  }

  return "https://homeharmonyhub.hu/api";
  // return "http://192.168.0.140:8096/api";
};

const API_BASE_URL = getBaseUrl();

const RETRY_COUNT = 3;
const RETRY_DELAY_MS = 700;
const REQUEST_TIMEOUT_MS = 2500;
const MAX_UPLOAD_DIMENSION = 1600;
const UPLOAD_COMPRESS_QUALITY = 0.7;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const ALLOWED_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "heic",
  "heif",
]);

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const sanitizeFileName = (value: string): string =>
  value.replace(/[^a-zA-Z0-9._-]/g, "_");

const getFileNameWithoutExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return fileName;
  }

  return fileName.slice(0, lastDotIndex);
};

const getFileExtension = (fileName?: string | null): string | null => {
  if (!fileName || !fileName.includes(".")) {
    return null;
  }

  return fileName.split(".").pop()?.toLowerCase() ?? null;
};

const getUploadMetadata = (photo: UploadPhotoAsset) => {
  const normalizedMimeType = photo.mimeType?.toLowerCase() ?? null;
  const extensionFromMime = normalizedMimeType
    ? EXTENSION_BY_MIME_TYPE[normalizedMimeType]
    : undefined;
  const extensionFromName = getFileExtension(photo.fileName);

  const extension =
    extensionFromMime ??
    (extensionFromName && ALLOWED_IMAGE_EXTENSIONS.has(extensionFromName)
      ? extensionFromName
      : "jpg");

  const mimeType =
    normalizedMimeType ?? MIME_TYPE_BY_EXTENSION[extension] ?? "image/jpeg";
  const fallbackName = `photo_${Date.now()}.${extension}`;
  const providedName = photo.fileName ? sanitizeFileName(photo.fileName) : "";
  const fileName = providedName || fallbackName;

  return {
    fileName,
    mimeType,
  };
};

const isCellularConnection = async (): Promise<boolean> => {
  try {
    const networkState = await getNetworkStateAsync();
    return networkState.type === NetworkStateType.CELLULAR;
  } catch {
    return false;
  }
};

const isServerReachable = async (): Promise<boolean> => {
  for (let attempt = 1; attempt <= RETRY_COUNT; attempt += 1) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const response = await fetch(`${API_BASE_URL}`, {
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

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();

    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
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

  async requestGiftAssistance(
    guestId: string,
    payload: GiftAssistancePayload,
  ): Promise<void> {
    const endpoints = [
      {
        path: `/guests/${guestId}/gift-assistance`,
        body: payload,
      },
      {
        path: `/guests/${guestId}/assistance`,
        body: payload,
      },
      {
        path: `/guests/${guestId}/assistance-request`,
        body: payload,
      },
      {
        path: "/gift-assistance",
        body: { guestId, ...payload },
      },
      {
        path: "/assistance-requests",
        body: { guestId, ...payload },
      },
    ];

    let lastError: unknown;

    for (const endpoint of endpoints) {
      try {
        await this.fetch(endpoint.path, {
          method: "POST",
          body: JSON.stringify(endpoint.body),
        });
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Failed to request gift assistance.");
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

  private async resolveUploadUri(photo: UploadPhotoAsset): Promise<{
    fileName: string;
    mimeType: string;
    uri: string;
    temporaryUri?: string;
  }> {
    const { fileName, mimeType } = getUploadMetadata(photo);

    if (Platform.OS !== "android" || !photo.uri.startsWith("content://")) {
      return {
        fileName,
        mimeType,
        uri: photo.uri,
      };
    }

    if (!FileSystem.cacheDirectory) {
      throw new Error("Upload cache directory is not available.");
    }

    const targetUri = `${FileSystem.cacheDirectory}upload-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}-${fileName}`;

    await FileSystem.copyAsync({
      from: photo.uri,
      to: targetUri,
    });

    return {
      fileName,
      mimeType,
      uri: targetUri,
      temporaryUri: targetUri,
    };
  }

  private async optimizeUploadUri(photo: UploadPhotoAsset): Promise<{
    fileName: string;
    mimeType: string;
    uri: string;
    temporaryUri?: string;
  }> {
    const { fileName } = getUploadMetadata(photo);
    const width = photo.width ?? 0;
    const height = photo.height ?? 0;
    const longestEdge = Math.max(width, height);
    const shouldResize = longestEdge > MAX_UPLOAD_DIMENSION;

    const result = await manipulateAsync(
      photo.uri,
      shouldResize
        ? [
            {
              resize:
                width >= height
                  ? {
                      width: MAX_UPLOAD_DIMENSION,
                    }
                  : {
                      height: MAX_UPLOAD_DIMENSION,
                    },
            },
          ]
        : [],
      {
        compress: UPLOAD_COMPRESS_QUALITY,
        format: SaveFormat.JPEG,
      },
    );

    return {
      fileName: `${getFileNameWithoutExtension(fileName)}.jpg`,
      mimeType: "image/jpeg",
      uri: result.uri,
      temporaryUri: result.uri,
    };
  }

  async uploadPhoto(
    guestId: string,
    photo: UploadPhotoAsset,
  ): Promise<UploadPhotoResponse> {
    const formData = new FormData();

    const isWeb =
      typeof window !== "undefined" && typeof window.document !== "undefined";

    if (isWeb) {
      const response = await fetch(photo.uri);
      const blob = await response.blob();

      const { fileName, mimeType } = getUploadMetadata({
        ...photo,
        mimeType: blob.type || photo.mimeType,
      });
      const uploadBlob =
        blob.type === mimeType ? blob : blob.slice(0, blob.size, mimeType);

      formData.append("photo", uploadBlob, fileName);
    } else {
      const normalizedPhoto = await this.resolveUploadUri(photo);
      const shouldOptimizeUpload = await isCellularConnection();
      const uploadPhoto = shouldOptimizeUpload
        ? await this.optimizeUploadUri({
            ...photo,
            uri: normalizedPhoto.uri,
            fileName: normalizedPhoto.fileName,
            mimeType: normalizedPhoto.mimeType,
          })
        : normalizedPhoto;

      try {
        formData.append("photo", {
          uri: uploadPhoto.uri,
          name: uploadPhoto.fileName,
          type: uploadPhoto.mimeType,
        } as any);

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
      } finally {
        if (
          shouldOptimizeUpload &&
          uploadPhoto.temporaryUri &&
          uploadPhoto.temporaryUri !== normalizedPhoto.temporaryUri
        ) {
          await FileSystem.deleteAsync(uploadPhoto.temporaryUri, {
            idempotent: true,
          }).catch(() => undefined);
        }

        if (normalizedPhoto.temporaryUri) {
          await FileSystem.deleteAsync(normalizedPhoto.temporaryUri, {
            idempotent: true,
          }).catch(() => undefined);
        }
      }
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
    const id = String(
      item.id ?? item.slug ?? item.collectionId ?? item.name ?? Date.now(),
    );

    return {
      id,
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
      hiddenFromGallery:
        Boolean(item.hiddenFromGallery) || id === PUZZLE_COLLECTION_ID,
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

    return collections
      .map((item: any) => this.normalizeGalleryCollection(item))
      .filter((collection: GalleryCollection) => !collection.hiddenFromGallery);
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
        this.resolvedService = this.api;

        // const reachable = await isServerReachable();
        // this.resolvedService = reachable ? this.api : this.mock;
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

  async requestGiftAssistance(
    guestId: string,
    payload: GiftAssistancePayload,
  ): Promise<void> {
    const service = await this.getService();
    return service.requestGiftAssistance(guestId, payload);
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
    photo: UploadPhotoAsset,
  ): Promise<UploadPhotoResponse> {
    const service = await this.getService();
    return service.uploadPhoto(guestId, photo);
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
