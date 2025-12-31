import {
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
import { getRandomizedQuestions } from "@/data/questions";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function IdentifyScreen() {
  const [name, setName] = useState("");
  const router = useRouter();
  const { setGuest, setAssignedQuestions } = useApp();

  const handleContinue = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Name Required", "Please enter your name to continue.");
      return;
    }

    const newGuest: Guest = {
      id: Date.now().toString(),
      name: trimmedName,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    await setGuest(newGuest);

    // Assign randomized questions to this guest
    const randomQuestions = getRandomizedQuestions();
    await setAssignedQuestions(randomQuestions);

    router.replace("/dashboard");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="dark" />

      <View style={styles.content}>
        <Text style={styles.title}>Üdvözlünk! 👋</Text>
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
          />
          <Text style={styles.hint}>
            Ha szeretnéd, használhatsz becenevet is.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, !name.trim() && styles.buttonDisabled]}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={!name.trim()}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F7",
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
