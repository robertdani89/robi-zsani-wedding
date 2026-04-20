import {
  AppEvent,
  EventRole,
  EventTemplate,
  Question,
  QuestionType,
  ServerEvent,
} from "@/types";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "@/services/api";

const STORAGE_KEYS = {
  EVENTS: "@events_app_events",
  ACTIVE_EVENT: "@events_app_active_event",
};

const DEFAULT_WEDDING_QUESTIONS: Question[] = [
  {
    id: "tpl_1",
    text: {
      en: "How do you know the hosts?",
      hu: "Honnan ismered a házigazdákat?",
    },
    type: QuestionType.SINGLE_CHOICE,
    options: [
      { en: "Family", hu: "Család" },
      { en: "Friends", hu: "Barátok" },
      { en: "Work / School", hu: "Munka / Iskola" },
      { en: "Other", hu: "Egyéb" },
    ],
  },
  {
    id: "tpl_2",
    text: {
      en: "What is your favorite memory with them?",
      hu: "Mi a kedvenc emlékeid velük?",
    },
    type: QuestionType.FREE_TEXT,
  },
  {
    id: "tpl_3",
    text: {
      en: "What advice would you give the couple?",
      hu: "Milyen tanácsot adnál a párnak?",
    },
    type: QuestionType.FREE_TEXT,
  },
  {
    id: "tpl_4",
    text: {
      en: "What are you most looking forward to?",
      hu: "Mire vársz a legjobban?",
    },
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { en: "The ceremony", hu: "A szertartás" },
      { en: "The party", hu: "A buli" },
      { en: "The food", hu: "Az étel" },
      { en: "Meeting everyone", hu: "Találkozás mindenkivel" },
      { en: "The music", hu: "A zene" },
    ],
  },
  {
    id: "tpl_5",
    text: {
      en: "How far did you travel to be here?",
      hu: "Milyen messziről jöttél?",
    },
    type: QuestionType.SINGLE_CHOICE,
    options: [
      { en: "Less than 30 min", hu: "Kevesebb mint 30 perc" },
      { en: "30 min – 2 hours", hu: "30 perc – 2 óra" },
      { en: "2 – 5 hours", hu: "2 – 5 óra" },
      { en: "More than 5 hours", hu: "Több mint 5 óra" },
    ],
  },
  {
    id: "tpl_6",
    text: {
      en: "Leave a wish or message for the hosts!",
      hu: "Hagyj egy kívánságot vagy üzenetet a házigazdáknak!",
    },
    type: QuestionType.FREE_TEXT,
  },
];

export const DEFAULT_WEDDING_TEMPLATE: EventTemplate = {
  id: "wedding",
  name: "Wedding Celebration",
  description:
    "A classic wedding guest experience with questions, photos, and music.",
  questions: DEFAULT_WEDDING_QUESTIONS,
  features: {
    photos: true,
    songs: true,
    gift: true,
    gallery: true,
    puzzle: true,
  },
};

const generateEventCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const mapServerEventToAppEvent = (
  event: ServerEvent,
  role: EventRole,
): AppEvent => ({
  id: event.id,
  code: event.code,
  name: event.name,
  date: event.date ?? "",
  organizerName: event.organizerName,
  template: {
    ...DEFAULT_WEDDING_TEMPLATE,
    questions: event.questions?.length
      ? event.questions
      : DEFAULT_WEDDING_TEMPLATE.questions,
  },
  role,
  createdAt: event.createdAt,
});

interface EventContextType {
  events: AppEvent[];
  activeEvent: AppEvent | null;
  isHydrated: boolean;
  createEvent: (
    name: string,
    date: string,
    organizerName?: string,
  ) => Promise<AppEvent>;
  joinEvent: (code: string) => Promise<AppEvent>;
  setActiveEvent: (eventId: string) => Promise<void>;
  updateEvent: (event: AppEvent) => Promise<void>;
  removeEvent: (eventId: string) => Promise<void>;
  leaveCurrentEvent: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [activeEvent, setActiveEventState] = useState<AppEvent | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, activeId] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.EVENTS),
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT),
      ]);

      const loadedEvents: AppEvent[] = eventsData ? JSON.parse(eventsData) : [];
      setEvents(loadedEvents);

      if (activeId) {
        const active = loadedEvents.find((e) => e.id === activeId) ?? null;
        setActiveEventState(active);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setIsHydrated(true);
    }
  };

  const persistEvents = async (updatedEvents: AppEvent[]) => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.EVENTS,
      JSON.stringify(updatedEvents),
    );
    setEvents(updatedEvents);
  };

  const createEvent = async (
    name: string,
    date: string,
    organizerName?: string,
  ): Promise<AppEvent> => {
    const serverEvent = await apiService.createEvent({
      code: generateEventCode(),
      name,
      date,
      organizerName,
      questions: DEFAULT_WEDDING_TEMPLATE.questions,
    });
    const event = mapServerEventToAppEvent(serverEvent, "organizer");

    const updatedEvents = [...events, event];
    await persistEvents(updatedEvents);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT, event.id);
    setActiveEventState(event);

    return event;
  };

  const joinEvent = async (code: string): Promise<AppEvent> => {
    const normalizedCode = code.trim().toUpperCase();
    const serverEvent = await apiService.getEventByCode(normalizedCode);
    const existing = events.find((e) => e.code === normalizedCode);
    const verifiedEvent = mapServerEventToAppEvent(
      serverEvent,
      existing?.role ?? "guest",
    );

    if (existing) {
      const updatedExisting = {
        ...existing,
        ...verifiedEvent,
        id: existing.id,
        role: existing.role,
      };
      const updatedEvents = events.map((event) =>
        event.id === existing.id ? updatedExisting : event,
      );
      await persistEvents(updatedEvents);
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT, updatedExisting.id);
      setActiveEventState(updatedExisting);
      return updatedExisting;
    }

    const event = verifiedEvent;

    const updatedEvents = [...events, event];
    await persistEvents(updatedEvents);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT, event.id);
    setActiveEventState(event);

    return event;
  };

  const setActiveEvent = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId) ?? null;
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT, eventId);
    setActiveEventState(event);
  };

  const updateEvent = async (updatedEvent: AppEvent) => {
    const updatedEvents = events.map((e) =>
      e.id === updatedEvent.id ? updatedEvent : e,
    );
    await persistEvents(updatedEvents);

    if (activeEvent?.id === updatedEvent.id) {
      setActiveEventState(updatedEvent);
    }
  };

  const removeEvent = async (eventId: string) => {
    const updatedEvents = events.filter((e) => e.id !== eventId);
    await persistEvents(updatedEvents);

    if (activeEvent?.id === eventId) {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_EVENT);
      setActiveEventState(null);
    }
  };

  const leaveCurrentEvent = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_EVENT);
    setActiveEventState(null);
  };

  return (
    <EventContext.Provider
      value={{
        events,
        activeEvent,
        isHydrated,
        createEvent,
        joinEvent,
        setActiveEvent,
        updateEvent,
        removeEvent,
        leaveCurrentEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used within EventProvider");
  }
  return context;
};
