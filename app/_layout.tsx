import { AppProvider } from "@/context/AppContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="identify" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="questions" />
        <Stack.Screen name="photos" />
        <Stack.Screen name="review" />
        <Stack.Screen name="completion" />
      </Stack>
    </AppProvider>
  );
}
