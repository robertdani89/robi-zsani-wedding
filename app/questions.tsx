import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Answer, Question, QuestionType } from "@/types";
import { useEffect, useState } from "react";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { StatusBar } from "expo-status-bar";
import apiService from "@/services/api";
import { showMessage } from "@/utils/alert";
import { useApp } from "@/context/AppContext";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";

export default function QuestionsScreen() {
  const router = useRouter();
  const { state, addAnswer, getAssignedQuestions } = useApp();
  const { t, locale } = useLocalization();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<Answer["value"]>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getOptionIndex = (
    question: Question,
    optionValue: unknown,
  ): number | null => {
    if (typeof optionValue === "number") {
      return optionValue;
    }

    if (typeof optionValue !== "string" || !question.options) {
      return null;
    }

    const index = question.options.findIndex(
      (option) =>
        option[locale] === optionValue ||
        option.en === optionValue ||
        option.hu === optionValue,
    );

    return index >= 0 ? index : null;
  };

  const normalizeStoredAnswer = (
    question: Question,
    value: unknown,
  ): Answer["value"] => {
    if (question.type === QuestionType.FREE_TEXT) {
      return typeof value === "string" ? value : "";
    }

    if (question.type === QuestionType.SINGLE_CHOICE) {
      const index = getOptionIndex(question, value);
      return index ?? "";
    }

    if (!Array.isArray(value)) {
      return [];
    }

    const indices = value
      .map((item) => getOptionIndex(question, item))
      .filter((item): item is number => item !== null);

    return Array.from(new Set(indices));
  };

  useEffect(() => {
    const assignedQuestions = getAssignedQuestions();
    if (assignedQuestions.length === 0) {
      showMessage(t("questions.errorTitle"), t("questions.noAssigned"));
      router.back();
      return;
    }
    setQuestions(assignedQuestions);

    // Load existing answer if available
    const existingAnswer = state.answers.find(
      (a) => a.questionId === assignedQuestions[0].id,
    );
    if (existingAnswer) {
      setCurrentAnswer(
        normalizeStoredAnswer(assignedQuestions[0], existingAnswer.value),
      );
    }
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      const existingAnswer = state.answers.find(
        (a) => a.questionId === currentQuestion.id,
      );
      if (existingAnswer) {
        setCurrentAnswer(
          normalizeStoredAnswer(currentQuestion, existingAnswer.value),
        );
      } else {
        setCurrentAnswer(
          currentQuestion.type === QuestionType.MULTIPLE_CHOICE ? [] : "",
        );
      }
    }
  }, [currentQuestionIndex, questions]);

  if (questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleSingleChoice = (optionIndex: number) => {
    setCurrentAnswer(optionIndex);
  };

  const handleMultipleChoice = (optionIndex: number) => {
    const currentAnswers = Array.isArray(currentAnswer)
      ? currentAnswer.filter(
          (value): value is number => typeof value === "number",
        )
      : [];

    if (currentAnswers.includes(optionIndex)) {
      setCurrentAnswer(currentAnswers.filter((a) => a !== optionIndex));
    } else {
      setCurrentAnswer([...currentAnswers, optionIndex]);
    }
  };

  const handleNext = async () => {
    const isSingleChoiceEmpty =
      currentQuestion.type === QuestionType.SINGLE_CHOICE &&
      typeof currentAnswer !== "number";
    const isMultipleChoiceEmpty =
      currentQuestion.type === QuestionType.MULTIPLE_CHOICE &&
      (!Array.isArray(currentAnswer) || currentAnswer.length === 0);
    const isFreeTextEmpty =
      currentQuestion.type === QuestionType.FREE_TEXT &&
      (typeof currentAnswer !== "string" || currentAnswer.trim().length === 0);

    if (isSingleChoiceEmpty || isMultipleChoiceEmpty || isFreeTextEmpty) {
      showMessage(
        t("questions.answerRequiredTitle"),
        t("questions.answerRequiredMessage"),
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit answer to server
      await apiService.submitAnswer(
        state.guest!.id,
        currentQuestion.id,
        currentAnswer,
      );

      // Save answer locally
      const newAnswer: Answer = {
        id: Date.now().toString(),
        guestId: state.guest!.id,
        questionId: currentQuestion.id,
        value: currentAnswer,
        answeredAt: new Date().toISOString(),
      };

      await addAnswer(newAnswer);

      // Move to next question or go back to dashboard
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        showMessage(
          t("questions.thankYouTitle"),
          t("questions.thankYouMessage"),
          () => router.replace("/dashboard"),
        );
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      showMessage(
        t("questions.submitErrorTitle"),
        t("questions.submitErrorMessage"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      router.back();
    }
  };

  const renderAnswerInput = () => {
    switch (currentQuestion.type) {
      case QuestionType.SINGLE_CHOICE:
        return (
          <Card style={styles.optionsContainer}>
            {currentQuestion.options?.map((option, index) => {
              const isSelected = currentAnswer === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleSingleChoice(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioOuter}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option[locale]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Card>
        );

      case QuestionType.MULTIPLE_CHOICE:
        const selectedOptions = Array.isArray(currentAnswer)
          ? currentAnswer.filter(
              (value): value is number => typeof value === "number",
            )
          : [];
        return (
          <Card style={styles.optionsContainer}>
            {currentQuestion.options?.map((option, index) => {
              const isSelected = selectedOptions.includes(index);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleMultipleChoice(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.checkboxOuter}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option[locale]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Card>
        );

      case QuestionType.FREE_TEXT:
        return (
          <Card>
            <TextInput
              style={styles.textInput}
              placeholder={t("questions.placeholder")}
              placeholderTextColor="#999"
              value={typeof currentAnswer === "string" ? currentAnswer : ""}
              onChangeText={setCurrentAnswer}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{t("common.back")}</Text>
          </TouchableOpacity>

          <View style={styles.progressIndicator}>
            <Text style={styles.progressText}>
              {t("questions.progress", {
                current: currentQuestionIndex + 1,
                total: questions.length,
              })}
            </Text>
          </View>
        </Card>

        <Card style={styles.questionCard}>
          <Text style={styles.questionText}>
            {currentQuestion.text[locale]}
          </Text>

          {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && (
            <Text style={styles.hint}>{t("questions.multiHint")}</Text>
          )}
        </Card>

        {renderAnswerInput()}

        <View style={styles.navigationButtons}>
          {currentQuestionIndex > 0 && (
            <TouchableOpacity
              style={styles.previousButton}
              onPress={handlePrevious}
              activeOpacity={0.7}
            >
              <Text style={styles.previousButtonText}>
                {t("questions.previous")}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>
              {currentQuestionIndex === questions.length - 1
                ? t("questions.finishLater")
                : t("questions.skip")}
            </Text>
          </TouchableOpacity>
        </View>

        {isSubmitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Button
            title={
              currentQuestionIndex === questions.length - 1
                ? t("questions.done")
                : t("questions.next")
            }
            onPress={handleNext}
            disabled={isSubmitting}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: "#D4526E",
    fontWeight: "600",
  },
  progressIndicator: {
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  questionCard: {
    marginBottom: 25,
  },
  categoryLabel: {
    fontSize: 12,
    color: "#D4526E",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  questionText: {
    fontSize: 20,
    color: "#333",
    fontWeight: "bold",
    lineHeight: 28,
  },
  hint: {
    fontSize: 13,
    color: "#999",
    marginTop: 10,
    fontStyle: "italic",
  },
  optionsContainer: {
    marginBottom: 25,
  },
  optionButton: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#FFD1DC",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  optionButtonSelected: {
    borderColor: "#D4526E",
    backgroundColor: "#FFF5F7",
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D4526E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D4526E",
  },
  checkboxOuter: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D4526E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkmark: {
    color: "#D4526E",
    fontSize: 16,
    fontWeight: "bold",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  optionTextSelected: {
    color: "#D4526E",
    fontWeight: "600",
  },
  textInput: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#FFD1DC",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#333",
    minHeight: 120,
    marginBottom: 25,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  previousButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  previousButtonText: {
    color: "#7D5260",
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    color: "#999",
    fontSize: 16,
    fontWeight: "600",
  },
});
