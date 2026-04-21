import type { GiftType, Guest } from "@/types";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { showDecision, showMessage } from "@/utils/alert";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { StatusBar } from "expo-status-bar";
import apiService from "@/services/api";
import { useApp } from "@/context/AppContext";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function GiftScreen() {
  const router = useRouter();
  const { state, setGuest } = useApp();
  const { t } = useLocalization();
  const isGiftGiven = !!state.guest?.gotGiftAt;
  const [selectedGiftType, setSelectedGiftType] = useState<GiftType | null>(
    null,
  );
  const [alsoForChild, setAlsoForChild] = useState(false);
  const [childGiftType, setChildGiftType] = useState<GiftType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestAssistance = async (
    guest: Guest,
    giftType: GiftType,
    gotGiftAt: string,
    childGift?: GiftType,
  ) => {
    setIsSubmitting(true);
    let shouldReturnToDashboard = true;

    try {
      await apiService.requestGiftAssistance(guest.id, {
        requestedAt: new Date().toISOString(),
        gotGiftAt,
        typeOfGift: giftType,
        childGiftType: childGift,
      });

      shouldReturnToDashboard = false;
      setIsSubmitting(false);
      showMessage(
        t("gift.assistanceSuccessTitle"),
        t("gift.assistanceSuccessMessage"),
        () => router.replace("/dashboard"),
      );
      return;
    } catch (error) {
      console.error("Gift assistance request error:", error);
      showMessage(
        t("gift.assistanceErrorTitle"),
        t("gift.assistanceErrorMessage"),
      );
    } finally {
      setIsSubmitting(false);
      if (shouldReturnToDashboard) {
        router.replace("/dashboard");
      }
    }
  };

  const promptGiftOutcome = (
    guest: Guest,
    giftType: GiftType,
    gotGiftAt: string,
    childGift?: GiftType,
  ) => {
    showDecision({
      title: t("gift.followUpTitle"),
      message: t("gift.followUpMessage"),
      confirmText: t("gift.gotGiftButton"),
      cancelText: t("gift.assistanceButton"),
      onConfirm: () => router.replace("/dashboard"),
      onCancel: () => {
        void handleRequestAssistance(guest, giftType, gotGiftAt, childGift);
      },
    });
  };

  const submitGiftRequest = async (guest: Guest, giftType: GiftType) => {
    setIsSubmitting(true);
    const childGift = alsoForChild ? (childGiftType ?? undefined) : undefined;

    try {
      const result = await apiService.openGift(guest.id, giftType, childGift);

      if (result.status !== "ok") {
        showMessage(
          t("questions.errorTitle"),
          result.message || "Unknown error",
        );
        return;
      }

      const refreshedGuest = await apiService.getGuest(guest.id);

      await setGuest({
        ...guest,
        ...refreshedGuest,
      });

      promptGiftOutcome(
        {
          ...guest,
          ...refreshedGuest,
        },
        giftType,
        refreshedGuest.gotGiftAt ?? new Date().toISOString(),
        childGift,
      );
    } catch (error) {
      console.error("Gift update error:", error);
      showMessage(t("gift.saveErrorTitle"), t("gift.saveErrorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGiveMe = () => {
    if (!state.guest) {
      showMessage(
        t("gift.missingGuestTitle"),
        t("gift.missingGuestMessage"),
        () => router.replace("/identify"),
      );
      return;
    }

    if (!selectedGiftType) {
      showMessage(
        t("gift.choiceRequiredTitle"),
        t("gift.choiceRequiredMessage"),
      );
      return;
    }

    if (alsoForChild && !childGiftType) {
      showMessage(
        t("gift.childChoiceRequiredTitle"),
        t("gift.childChoiceRequiredMessage"),
      );
      return;
    }

    const guest = state.guest;
    const giftType = selectedGiftType;

    showDecision({
      title: t("gift.confirmMachineTitle"),
      message: t("gift.confirmMachineMessage"),
      confirmText: t("gift.confirmMachineButton"),
      cancelText: t("common.cancel"),
      onConfirm: () => {
        void submitGiftRequest(guest, giftType);
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{t("common.back")}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {isGiftGiven ? t("dashboard.completedSubtitle1") : t("gift.title")}
          </Text>
          <Text style={styles.subtitle}>
            {isGiftGiven
              ? t("dashboard.completedSubtitle2")
              : t("gift.subtitle")}
          </Text>
        </Card>

        {!isGiftGiven && (
          <Card style={styles.machine}>
            <Image
              source={require("../assets/machine.jpg")}
              style={styles.machineImage}
              resizeMode="cover"
            />
          </Card>
        )}

        {!isGiftGiven && (
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

            {/* Also for child checkbox */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => {
                setAlsoForChild((v) => !v);
                setChildGiftType(null);
              }}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <View
                style={[styles.checkbox, alsoForChild && styles.checkboxActive]}
              >
                {alsoForChild && (
                  <Text style={styles.checkboxTick}>{"\u2713"}</Text>
                )}
              </View>
              <Text style={styles.optionText}>{t("gift.alsoForChild")}</Text>
            </TouchableOpacity>

            {alsoForChild && (
              <View style={styles.childSelectionCard}>
                <Text style={styles.selectionTitle}>
                  {t("gift.childSelectionTitle")}
                </Text>

                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => setChildGiftType("gift_for_man")}
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      childGiftType === "gift_for_man" &&
                        styles.radioOuterActive,
                    ]}
                  >
                    {childGiftType === "gift_for_man" && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.optionText}>{t("gift.forBoy")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => setChildGiftType("gift_for_ladies")}
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      childGiftType === "gift_for_ladies" &&
                        styles.radioOuterActive,
                    ]}
                  >
                    {childGiftType === "gift_for_ladies" && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.optionText}>{t("gift.forGirl")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        )}

        {!isGiftGiven && (
          <Button
            title={t("gift.submit")}
            onPress={handleGiveMe}
            disabled={
              !selectedGiftType ||
              (alsoForChild && !childGiftType) ||
              isSubmitting
            }
          />
        )}
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
  machineImage: {
    width: "100%",
    height: 260,
    borderRadius: 16,
    marginBottom: 24,
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#C9A5B0",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    borderColor: "#D4526E",
    backgroundColor: "#D4526E",
  },
  checkboxTick: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  childSelectionCard: {
    backgroundColor: "#FFF7F9",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0C5CE",
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
