import { ActivityIndicator, View } from "react-native";

import { StatusBar } from "expo-status-bar";
import { useApp } from "@/context/AppContext";
import { useEffect } from "react";
import { useEvent } from "@/context/EventContext";
import { useRouter } from "expo-router";

export default function DashboardScreen() {
  const router = useRouter();
  const { state, isHydrated } = useApp();
  const { activeEvent, isHydrated: eventHydrated } = useEvent();

  useEffect(() => {
    if (!isHydrated || !eventHydrated) {
      return;
    }

    if (!activeEvent) {
      router.replace("/");
      return;
    }

    if (!state.guest && activeEvent.role !== "organizer") {
      router.replace("/identify");
      return;
    }

    const resolvedRole = state.guest?.role ?? activeEvent.role ?? "guest";

    if (resolvedRole === "organizer") {
      router.replace("/admin-dashboard");
      return;
    }

    if (resolvedRole === "assistant") {
      router.replace("/assistant-dashboard");
      return;
    }

    router.replace("/guest-dashboard");
  }, [activeEvent, eventHydrated, isHydrated, router, state.guest]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
      }}
    >
      <StatusBar style="dark" />
      <ActivityIndicator size="large" color="#D4526E" />
    </View>
  );
}
