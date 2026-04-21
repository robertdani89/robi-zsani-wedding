import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Question, QuestionType } from "@/types";
import { showDecision, showMessage } from "@/utils/alert";
import { useEffect, useState } from "react";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { StatusBar } from "expo-status-bar";
import { useApp } from "@/context/AppContext";
import { useEvent } from "@/context/EventContext";
import { useFonts } from "expo-font";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";

export default function EditTemplateScreen() {
  const router = useRouter();
  const { t, locale } = useLocalization();
  const { activeEvent, updateEvent } = useEvent();
  const { state } = useApp();
  const [fontsLoaded] = useFonts({
    GreatVibes: require("@/assets/GreatVibes-Regular.ttf"),
  });

  const [questions, setQuestions] = useState<Question[]>(
    activeEvent?.questions ?? [],
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestionEn, setNewQuestionEn] = useState("");
  const [newQuestionHu, setNewQuestionHu] = useState("");
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>(
    QuestionType.FREE_TEXT,
  );
  const [newOptions, setNewOptions] = useState<{ en: string; hu: string }[]>(
    [],
  );

  useEffect(() => {
    const resolvedRole = state.guest?.role ?? activeEvent?.role ?? "guest";

    if (resolvedRole !== "organizer") {
      router.replace("/dashboard");
    }
  }, [activeEvent?.role, router, state.guest?.role]);

  if (!fontsLoaded || !activeEvent) {
    return null;
  }

  const handleRemoveQuestion = (questionId: string) => {
    showDecision({
      title: t("editTemplate.removeTitle"),
      message: t("editTemplate.removeMessage"),
      confirmText: t("editTemplate.remove"),
      cancelText: t("common.cancel"),
      onConfirm: () => {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      },
    });
  };

  const handleAddOption = () => {
    setNewOptions((prev) => [...prev, { en: "", hu: "" }]);
  };

  const handleRemoveOption = (index: number) => {
    setNewOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateOption = (
    index: number,
    lang: "en" | "hu",
    value: string,
  ) => {
    setNewOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [lang]: value } : opt)),
    );
  };

  const handleAddQuestion = () => {
    if (!newQuestionEn.trim() && !newQuestionHu.trim()) {
      showMessage(
        t("editTemplate.requiredTitle"),
        t("editTemplate.questionRequired"),
      );
      return;
    }

    const newQuestion: Question = {
      id: `custom_${Date.now()}`,
      text: {
        en: newQuestionEn.trim() || newQuestionHu.trim(),
        hu: newQuestionHu.trim() || newQuestionEn.trim(),
      },
      type: newQuestionType,
      ...(newQuestionType !== QuestionType.FREE_TEXT &&
        newOptions.length > 0 && {
          options: newOptions
            .filter((o) => o.en.trim() || o.hu.trim())
            .map((o) => ({
              en: o.en.trim() || o.hu.trim(),
              hu: o.hu.trim() || o.en.trim(),
            })),
        }),
    };

    setQuestions((prev) => [...prev, newQuestion]);
    setNewQuestionEn("");
    setNewQuestionHu("");
    setNewQuestionType(QuestionType.FREE_TEXT);
    setNewOptions([]);
    setShowAddForm(false);
  };

  const handleSave = async () => {
    const updatedEvent = {
      ...activeEvent,
      questions,
    };

    await updateEvent(updatedEvent);
    showMessage(
      t("editTemplate.savedTitle"),
      t("editTemplate.savedMessage"),
      () => router.back(),
      t("common.done"),
    );
  };

  const questionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.SINGLE_CHOICE:
        return t("editTemplate.singleChoice");
      case QuestionType.MULTIPLE_CHOICE:
        return t("editTemplate.multipleChoice");
      case QuestionType.FREE_TEXT:
        return t("editTemplate.freeText");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <StatusBar style="dark" />

        <Card>
          <Text style={[styles.text, styles.title]}>
            {t("editTemplate.title")}
          </Text>
          <Text style={[styles.text, styles.subtitle]}>
            {t("editTemplate.subtitle")}
          </Text>
        </Card>

        <Card style={styles.questionsContainer}>
          <Text style={styles.sectionTitle}>
            {t("editTemplate.questions", { count: questions.length })}
          </Text>

          {questions.map((question, index) => (
            <View key={question.id} style={styles.questionCard}>
              <View style={styles.questionContent}>
                <Text style={styles.questionNumber}>#{index + 1}</Text>
                <Text style={styles.questionText}>
                  {question.text[locale] || question.text.en}
                </Text>
                <Text style={styles.questionType}>
                  {questionTypeLabel(question.type)}
                </Text>
                {question.options && question.options.length > 0 && (
                  <Text style={styles.optionsPreview}>
                    {question.options.map((o) => o[locale] || o.en).join(" · ")}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveQuestion(question.id)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          {!showAddForm ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddForm(true)}
            >
              <Text style={styles.addButtonText}>
                + {t("editTemplate.addQuestion")}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addForm}>
              <Text style={styles.formLabel}>
                {t("editTemplate.questionEn")}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t("editTemplate.questionPlaceholder")}
                placeholderTextColor="#999"
                value={newQuestionEn}
                onChangeText={setNewQuestionEn}
              />

              <Text style={styles.formLabel}>
                {t("editTemplate.questionHu")}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t("editTemplate.questionPlaceholder")}
                placeholderTextColor="#999"
                value={newQuestionHu}
                onChangeText={setNewQuestionHu}
              />

              <Text style={styles.formLabel}>
                {t("editTemplate.questionType")}
              </Text>
              <View style={styles.typeSelector}>
                {[
                  QuestionType.FREE_TEXT,
                  QuestionType.SINGLE_CHOICE,
                  QuestionType.MULTIPLE_CHOICE,
                ].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      newQuestionType === type && styles.typeOptionSelected,
                    ]}
                    onPress={() => setNewQuestionType(type)}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        newQuestionType === type &&
                          styles.typeOptionTextSelected,
                      ]}
                    >
                      {questionTypeLabel(type)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {newQuestionType !== QuestionType.FREE_TEXT && (
                <View style={styles.optionsSection}>
                  <Text style={styles.formLabel}>
                    {t("editTemplate.options")}
                  </Text>
                  {newOptions.map((option, index) => (
                    <View key={index} style={styles.optionRow}>
                      <View style={styles.optionInputs}>
                        <TextInput
                          style={[styles.input, styles.optionInput]}
                          placeholder="EN"
                          placeholderTextColor="#999"
                          value={option.en}
                          onChangeText={(v) =>
                            handleUpdateOption(index, "en", v)
                          }
                        />
                        <TextInput
                          style={[styles.input, styles.optionInput]}
                          placeholder="HU"
                          placeholderTextColor="#999"
                          value={option.hu}
                          onChangeText={(v) =>
                            handleUpdateOption(index, "hu", v)
                          }
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveOption(index)}
                      >
                        <Text style={styles.removeOptionText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.addOptionButton}
                    onPress={handleAddOption}
                  >
                    <Text style={styles.addOptionText}>
                      + {t("editTemplate.addOption")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.addFormActions}>
                <TouchableOpacity
                  style={styles.formButton}
                  onPress={handleAddQuestion}
                >
                  <Text style={styles.formButtonText}>
                    {t("editTemplate.confirmAdd")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formButton, styles.formButtonCancel]}
                  onPress={() => {
                    setShowAddForm(false);
                    setNewQuestionEn("");
                    setNewQuestionHu("");
                    setNewOptions([]);
                  }}
                >
                  <Text style={styles.formButtonCancelText}>
                    {t("common.cancel")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Card>

        <View style={styles.actions}>
          <Button title={t("editTemplate.save")} onPress={handleSave} />
          <View style={styles.spacer} />
          <Button title={t("common.back")} onPress={() => router.back()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "GreatVibes",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    color: "#D4526E",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7D5260",
  },
  questionsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },
  questionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  questionContent: {
    flex: 1,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D4526E",
    marginBottom: 4,
  },
  questionText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 4,
  },
  questionType: {
    fontSize: 12,
    color: "#999",
  },
  optionsPreview: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FEE",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  removeButtonText: {
    fontSize: 14,
    color: "#F44336",
    fontWeight: "700",
  },
  addButton: {
    borderWidth: 2,
    borderColor: "#FFD1DC",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 5,
  },
  addButtonText: {
    fontSize: 16,
    color: "#D4526E",
    fontWeight: "600",
  },
  addForm: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 5,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#333",
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  typeOptionSelected: {
    backgroundColor: "#D4526E",
    borderColor: "#D4526E",
  },
  typeOptionText: {
    fontSize: 13,
    color: "#333",
  },
  typeOptionTextSelected: {
    color: "#FFF",
    fontWeight: "600",
  },
  optionsSection: {
    marginTop: 4,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  optionInputs: {
    flex: 1,
    flexDirection: "column",
    gap: 8,
  },
  optionInput: {
    flex: 1,
  },
  removeOptionText: {
    fontSize: 16,
    color: "#F44336",
    marginLeft: 8,
  },
  addOptionButton: {
    paddingVertical: 8,
    alignItems: "center",
  },
  addOptionText: {
    fontSize: 14,
    color: "#D4526E",
    fontWeight: "600",
  },
  addFormActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#D4526E",
    alignItems: "center",
  },
  formButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  formButtonCancel: {
    backgroundColor: "#F5F5F5",
  },
  formButtonCancelText: {
    color: "#333",
    fontSize: 15,
    fontWeight: "600",
  },
  actions: {
    marginTop: 25,
  },
  spacer: {
    height: 12,
  },
});
