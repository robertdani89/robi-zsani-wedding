import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { AppEvent } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/constants";
import apiService from "@/services/api";

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
  leaveCurrentEvent: (forGood?: boolean) => Promise<void>;
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
    console.log("Persisting events:", updatedEvents);
    await AsyncStorage.setItem(
      STORAGE_KEYS.EVENTS,
      JSON.stringify(updatedEvents),
    );
    setEvents(updatedEvents);
  };

  const createEvent = async (name: string, date: string): Promise<AppEvent> => {
    const event = await apiService.createEvent({
      name,
      date,
    });

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
    // const verifiedEvent = mapServerEventToAppEvent(
    //   serverEvent,
    //   existing?.role ?? "guest",
    // );

    if (existing) {
      const updatedExisting = {
        ...existing,
        ...serverEvent,
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

    const event = serverEvent;

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
    await apiService.updateEvent(updatedEvent.id, updatedEvent);

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

  const leaveCurrentEvent = async (forGood = false) => {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_EVENT);

    if (forGood && activeEvent) {
      const newEvents = events.filter((e) => e.id !== activeEvent.id);
      await persistEvents(newEvents);
    }

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
