import { DefaultTheme, ThemeProvider } from "@react-navigation/native";

import { AppProvider } from "@/context/AppContext";
import { EventProvider } from "@/context/EventContext";
import { LocalizationProvider } from "@/context/LocalizationContext";
import { Stack } from "expo-router";

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
  },
};

export default function RootLayout() {
  return (
    <LocalizationProvider>
      <EventProvider>
        <AppProvider>
          {/* <BackgroundWithLeaves> */}
          <ThemeProvider value={MyTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="create-event" />
              <Stack.Screen name="join-event" />
              <Stack.Screen name="identify" />
              <Stack.Screen name="dashboard" />
              <Stack.Screen name="admin-dashboard" />
              <Stack.Screen name="assistant-dashboard" />
              <Stack.Screen name="guest-dashboard" />
              <Stack.Screen name="questions" />
              <Stack.Screen name="photos" />
              <Stack.Screen name="song" />
              <Stack.Screen name="assist" />
              <Stack.Screen name="gift" />
              <Stack.Screen name="puzzle" />
              <Stack.Screen name="edit-template" />
              <Stack.Screen name="admin/index" />
              <Stack.Screen name="admin/guest/[id]" />
              <Stack.Screen name="galery/index" />
              <Stack.Screen name="galery/[id]" />
            </Stack>
          </ThemeProvider>
          {/* </BackgroundWithLeaves> */}
        </AppProvider>
      </EventProvider>
    </LocalizationProvider>
  );
}
