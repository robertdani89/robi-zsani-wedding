import { DefaultTheme, ThemeProvider } from "@react-navigation/native";

import { AppProvider } from "@/context/AppContext";
import BackgroundWithLeaves from "@/components/BackgroundWithLeaves";
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
      <AppProvider>
        {/* <BackgroundWithLeaves> */}
        <ThemeProvider value={MyTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="identify" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="questions" />
            <Stack.Screen name="photos" />
            <Stack.Screen name="song" />
            <Stack.Screen name="gift" />
            <Stack.Screen name="puzzle" />
            <Stack.Screen name="galery/index" />
            <Stack.Screen name="galery/[id]" />
          </Stack>
        </ThemeProvider>
        {/* </BackgroundWithLeaves> */}
      </AppProvider>
    </LocalizationProvider>
  );
}
