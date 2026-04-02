import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Card from "@/components/Card";
import { StatusBar } from "expo-status-bar";
import apiService from "@/services/api";
import { useApp } from "@/context/AppContext";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";
import { useState } from "react";

type GiftType = "gift_for_man" | "gift_for_ladies";

export default function GiftScreen() {
  const router = useRouter();
  const { state, setGuest } = useApp();
  const { t } = useLocalization();
  const [selectedGiftType, setSelectedGiftType] = useState<GiftType | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGiveMe = async () => {
    if (!state.guest) {
      Alert.alert(t("gift.missingGuestTitle"), t("gift.missingGuestMessage"));
      router.replace("/identify");
      return;
    }

    if (!selectedGiftType) {
      Alert.alert(
        t("gift.choiceRequiredTitle"),
        t("gift.choiceRequiredMessage"),
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const gotGiftAt = new Date().toISOString();

      const updatedGuest = await apiService.updateGuest(state.guest.id, {
        gotGiftAt,
        typeOfGift: selectedGiftType,
      });

      await setGuest({
        ...state.guest,
        ...updatedGuest,
        gotGiftAt,
        typeOfGift: selectedGiftType,
      });

      router.replace("/dashboard");
    } catch (error) {
      console.error("Gift update error:", error);
      Alert.alert(t("gift.saveErrorTitle"), t("gift.saveErrorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{t("common.back")}</Text>
        </TouchableOpacity>
        <Card style={styles.header}>
          <Text style={styles.title}>{t("gift.title")}</Text>
          <Text style={styles.subtitle}>{t("gift.subtitle")}</Text>
        </Card>

        <Card style={styles.machine}>
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>{t("gift.placeholder")}</Text>
          </View>
        </Card>

        <Card style={styles.options}>
          <View style={styles.selectionCard}>
            <Text style={styles.selectionTitle}>
              {t("gift.selectionTitle")}
            </Text>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSelectedGiftType("gift_for_man")}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <View
                style={[
                  styles.radioOuter,
                  selectedGiftType === "gift_for_man" &&
                    styles.radioOuterActive,
                ]}
              >
                {selectedGiftType === "gift_for_man" && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text style={styles.optionText}>{t("gift.forMen")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSelectedGiftType("gift_for_ladies")}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <View
                style={[
                  styles.radioOuter,
                  selectedGiftType === "gift_for_ladies" &&
                    styles.radioOuterActive,
                ]}
              >
                {selectedGiftType === "gift_for_ladies" && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text style={styles.optionText}>{t("gift.forWomen")}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <TouchableOpacity
          style={[
            styles.giveButton,
            (!selectedGiftType || isSubmitting) && styles.giveButtonDisabled,
          ]}
          onPress={handleGiveMe}
          activeOpacity={0.85}
          disabled={!selectedGiftType || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.giveButtonText}>{t("gift.submit")}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: "#D4526E",
    fontWeight: "600",
  },
  header: {
    marginBottom: 30,
  },
  machine: {
    marginBottom: 30,
  },
  options: {
    marginBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#D4526E",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#7D5260",
    marginBottom: 24,
  },
  placeholderBox: {
    height: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFD1DC",
    borderStyle: "dashed",
    backgroundColor: "#FFF6F8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  placeholderText: {
    color: "#A86C79",
    fontSize: 16,
    fontWeight: "600",
  },
  selectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 14,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#C9A5B0",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderColor: "#D4526E",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D4526E",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  giveButton: {
    backgroundColor: "#D4526E",
    paddingVertical: 20,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  giveButtonDisabled: {
    backgroundColor: "#D9D9D9",
    elevation: 0,
  },
  giveButtonText: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
  },
});
