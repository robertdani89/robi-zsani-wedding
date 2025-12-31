import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Answer, Question, QuestionType } from "@/types";
import { useEffect, useState } from "react";

import { StatusBar } from "expo-status-bar";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";

export default function QuestionsScreen() {
  const router = useRouter();
  const { state, addAnswer, getAssignedQuestions } = useApp();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>("");

  useEffect(() => {
    const assignedQuestions = getAssignedQuestions();
    if (assignedQuestions.length === 0) {
      Alert.alert("Error", "No questions assigned");
      router.back();
      return;
    }
    setQuestions(assignedQuestions);

    // Load existing answer if available
    const existingAnswer = state.answers.find(
      (a) => a.questionId === assignedQuestions[0].id
    );
    if (existingAnswer) {
      setCurrentAnswer(existingAnswer.value);
    }
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      const existingAnswer = state.answers.find(
        (a) => a.questionId === currentQuestion.id
      );
      if (existingAnswer) {
        setCurrentAnswer(existingAnswer.value);
      } else {
        setCurrentAnswer(
          currentQuestion.type === QuestionType.MULTIPLE_CHOICE ? [] : ""
        );
      }
    }
  }, [currentQuestionIndex, questions]);

  if (questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleSingleChoice = (option: string) => {
    setCurrentAnswer(option);
  };

  const handleMultipleChoice = (option: string) => {
    const currentAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
    if (currentAnswers.includes(option)) {
      setCurrentAnswer(currentAnswers.filter((a) => a !== option));
    } else {
      setCurrentAnswer([...currentAnswers, option]);
    }
  };

  const handleNext = async () => {
    // Validate answer
    if (
      !currentAnswer ||
      (Array.isArray(currentAnswer) && currentAnswer.length === 0)
    ) {
      Alert.alert(
        "Answer Required",
        "Please provide an answer before continuing."
      );
      return;
    }

    // Save answer
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
      Alert.alert(
        "Great Job!",
        "You've answered all the questions. You can review your answers anytime.",
        [{ text: "OK", onPress: () => router.back() }]
      );
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
          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option, index) => {
              const isSelected = currentAnswer === option;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleSingleChoice(option)}
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
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case QuestionType.MULTIPLE_CHOICE:
        const selectedOptions = Array.isArray(currentAnswer)
          ? currentAnswer
          : [];
        return (
          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option, index) => {
              const isSelected = selectedOptions.includes(option);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleMultipleChoice(option)}
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
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case QuestionType.FREE_TEXT:
        return (
          <TextInput
            style={styles.textInput}
            placeholder="Type your answer here..."
            placeholderTextColor="#999"
            value={typeof currentAnswer === "string" ? currentAnswer : ""}
            onChangeText={setCurrentAnswer}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
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
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.progressIndicator}>
            <Text style={styles.progressText}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>
          </View>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.categoryLabel}>{currentQuestion.category}</Text>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>

          {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && (
            <Text style={styles.hint}>Select all that apply</Text>
          )}
        </View>

        {renderAnswerInput()}

        <View style={styles.navigationButtons}>
          {currentQuestionIndex > 0 && (
            <TouchableOpacity
              style={styles.previousButton}
              onPress={handlePrevious}
              activeOpacity={0.7}
            >
              <Text style={styles.previousButtonText}>← Previous</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>
              {currentQuestionIndex === questions.length - 1
                ? "Finish Later"
                : "Skip"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex === questions.length - 1
              ? "Complete"
              : "Next"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F7",
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
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  nextButton: {
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
  nextButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
