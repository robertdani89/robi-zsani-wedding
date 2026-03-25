import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Guest } from "@/types";
import { StatusBar } from "expo-status-bar";
import apiService from "@/services/api";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import { useState } from "react";

const ADMIN_SECRET = "zsanirobi";

export default function IdentifyScreen() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setGuest, setAssignedQuestions } = useApp();

  const handleContinue = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Name Required", "Please enter your name to continue.");
      return;
    }

    // Check for admin secret
    if (trimmedName.toLowerCase() === ADMIN_SECRET) {
      router.replace("/admin");
      return;
    }

    setIsLoading(true);

    try {
      // Register guest on server and get assigned questions
      const { guest: serverGuest, questions } =
        await apiService.registerGuest(trimmedName);

      const newGuest: Guest = {
        id: serverGuest.id,
        name: serverGuest.name,
        completed: false,
        createdAt: serverGuest.createdAt,
      };

      await setGuest(newGuest);
      await setAssignedQuestions(questions);

      router.replace("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        "Connection Error",
        "Could not connect to the server. Please check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="dark" />

      <View style={styles.content}>
        <Text style={styles.title}>Csodás, hogy itt vagy! 👋</Text>
        <Text style={styles.subtitle}>Köszönjük, hogy velünk ünnepelsz!</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mi a neved?</Text>
          <TextInput
            style={styles.input}
            placeholder="Írd be kérlek a neved"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleContinue}
            editable={!isLoading}
          />
          <Text style={styles.hint}>
            Ha szeretnéd, használhatsz becenevet is.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (!name.trim() || isLoading) && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={!name.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Kezdjük!</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#D4526E",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#7D5260",
    marginBottom: 50,
  },
  inputContainer: {
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#FFD1DC",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
  },
  hint: {
    fontSize: 13,
    color: "#999",
    marginTop: 8,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#D4526E",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    backgroundColor: "#DDD",
    elevation: 0,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
