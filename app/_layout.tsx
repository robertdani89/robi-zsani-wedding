import { DefaultTheme, ThemeProvider } from "@react-navigation/native";

import { AppProvider } from "@/context/AppContext";
import BackgroundWithLeaves from "@/components/BackgroundWithLeaves";
import LanguageSwitcher from "@/components/LanguageSwitcher";
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
        <BackgroundWithLeaves>
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
              <Stack.Screen name="gift" />
            </Stack>
          </ThemeProvider>
          <LanguageSwitcher />
        </BackgroundWithLeaves>
      </AppProvider>
    </LocalizationProvider>
  );
}
