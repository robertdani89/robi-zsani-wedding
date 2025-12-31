import { Question, QuestionCategory, QuestionType } from "@/types";

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    category: QuestionCategory.TRAVEL,
    text: "Where would you like to go on your next vacation?",
    type: QuestionType.SINGLE_CHOICE,
    options: [
      "Beach paradise",
      "Mountain retreat",
      "City exploration",
      "Countryside escape",
    ],
  },
  {
    id: "q2",
    category: QuestionCategory.TRAVEL,
    text: "What type of accommodation do you prefer?",
    type: QuestionType.SINGLE_CHOICE,
    options: ["Luxury hotel", "Cozy Airbnb", "Camping", "Boutique hostel"],
  },
  {
    id: "q3",
    category: QuestionCategory.TRAVEL,
    text: "Which travel style describes you best?",
    type: QuestionType.SINGLE_CHOICE,
    options: [
      "Adventure seeker",
      "Relaxation lover",
      "Cultural explorer",
      "Foodie traveler",
    ],
  },

  {
    id: "q4",
    category: QuestionCategory.ACTIVITIES,
    text: "What activities do you enjoy the most? (Select all that apply)",
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      "Reading",
      "Sports",
      "Cooking",
      "Gaming",
      "Hiking",
      "Music",
      "Art",
    ],
  },
  {
    id: "q5",
    category: QuestionCategory.ACTIVITIES,
    text: "How do you prefer to spend your weekends?",
    type: QuestionType.SINGLE_CHOICE,
    options: [
      "Outdoor adventures",
      "Social gatherings",
      "Home relaxation",
      "Cultural events",
    ],
  },
  {
    id: "q6",
    category: QuestionCategory.ACTIVITIES,
    text: "What's your favorite way to stay active?",
    type: QuestionType.SINGLE_CHOICE,
    options: [
      "Gym workouts",
      "Team sports",
      "Yoga/Pilates",
      "Running/Walking",
      "Not my thing",
    ],
  },

  {
    id: "q7",
    category: QuestionCategory.FUN,
    text: "What's your go-to comfort food?",
    type: QuestionType.FREE_TEXT,
    options: undefined,
  },
  {
    id: "q8",
    category: QuestionCategory.FUN,
    text: "If you could have any superpower, what would it be?",
    type: QuestionType.SINGLE_CHOICE,
    options: [
      "Flying",
      "Invisibility",
      "Super strength",
      "Time travel",
      "Mind reading",
    ],
  },
  {
    id: "q9",
    category: QuestionCategory.FUN,
    text: "What's your ideal way to celebrate?",
    type: QuestionType.SINGLE_CHOICE,
    options: [
      "Big party",
      "Intimate dinner",
      "Quiet evening at home",
      "Adventure trip",
    ],
  },
  {
    id: "q10",
    category: QuestionCategory.FUN,
    text: "Coffee or tea?",
    type: QuestionType.SINGLE_CHOICE,
    options: ["Coffee", "Tea", "Both!", "Neither"],
  },
  {
    id: "q11",
    category: QuestionCategory.FUN,
    text: "What makes you laugh the most?",
    type: QuestionType.FREE_TEXT,
    options: undefined,
  },
  {
    id: "q12",
    category: QuestionCategory.FUN,
    text: "Morning person or night owl?",
    type: QuestionType.SINGLE_CHOICE,
    options: [
      "Definitely morning",
      "Night owl all the way",
      "Depends on the day",
    ],
  },
];

export const MIN_QUESTIONS_TO_ANSWER = 8;
export const MIN_PHOTOS_REQUIRED = 1;
export const MAX_PHOTOS_ALLOWED = 5;

export const getRandomizedQuestions = (
  count: number = MIN_QUESTIONS_TO_ANSWER
): Question[] => {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const groupQuestionsByCategory = (questions: Question[]) => {
  return questions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {} as Record<QuestionCategory, Question[]>);
};
