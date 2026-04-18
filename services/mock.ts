// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

import {
  QuestionType,
  type Answer,
  type GalleryCollection,
  type GalleryPhoto,
  type GiftAssistancePayload,
  type GiftType,
  type Guest,
  type PendingSongReview,
  type Photo,
  type Question,
  type Song,
  type SpotifySearchResult,
  type UpdateGuestPayload,
  type UploadPhotoAsset,
  type UploadPhotoResponse,
} from "@/types";
import { PUZZLE_COLLECTION_ID, PUZZLE_COLLECTION_NAME } from "./constants";

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
    id: PUZZLE_COLLECTION_ID,
    title: PUZZLE_COLLECTION_NAME,
    description:
      "Meet our beloved dogs, who are part of our family and often steal the spotlight!",
    thumbnailUrl: "https://picsum.photos/seed/our-little-pets/900/600",
    photoCount: 5,
    hiddenFromGallery: true,
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

export class MockApiService {
  private guests: Map<string, Guest> = new Map();
  private answers: Answer[] = [];
  private songs: Map<string, PendingSongReview> = new Map();

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

  async requestGiftAssistance(
    _guestId: string,
    _payload: GiftAssistancePayload,
  ): Promise<void> {
    await this.delay();
  }

  async openGift(
    guestId: string,
    giftType: GiftType,
  ): Promise<{ status: string; message: string }> {
    await this.delay();
    const existing =
      this.guests.get(guestId) ?? this.makeGuest(guestId, "Teszt Vendég");
    this.guests.set(guestId, {
      ...existing,
      gotGiftAt: new Date().toISOString(),
      typeOfGift: giftType,
    });
    return { status: "success", message: "Gift opened successfully." };
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
    _photo: UploadPhotoAsset,
  ): Promise<UploadPhotoResponse> {
    await this.delay(800);
    const id = `mock-photo-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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
    return MOCK_GALLERY_COLLECTIONS.filter(
      (collection) => !collection.hiddenFromGallery,
    );
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
    const guest = this.guests.get(songData.guestId);
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

    this.songs.set(songData.guestId, {
      ...song,
      allowed: null,
      guestId: songData.guestId,
      guestName: guest?.name,
    });

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

  async getNextPendingSong(): Promise<PendingSongReview | null> {
    await this.delay();

    for (const song of this.songs.values()) {
      if (song.allowed === null || song.allowed === undefined) {
        return song;
      }
    }

    return null;
  }

  async updateSongAllowed(
    songId: string,
    allowed: boolean,
  ): Promise<PendingSongReview> {
    await this.delay();

    for (const [guestId, song] of this.songs.entries()) {
      if (song.id === songId) {
        const updatedSong: PendingSongReview = {
          ...song,
          allowed,
        };

        this.songs.set(guestId, updatedSong);
        return updatedSong;
      }
    }

    throw new Error("Song not found.");
  }
}
