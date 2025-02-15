// src/hooks/useQuiz.ts
import { useState, useCallback, useEffect } from "react";
import { Question, Topic, Difficulty } from "@/types/quiz";

interface TopicProgress {
  total: number;
  correct: number;
  mastered: boolean;
}

interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  streak: number;
  correctAnswersInRow: number;
  difficulty: Difficulty;
  totalQuestions: number;
  answeredTopics: Set<Topic>;
  lastQuestionType?: Topic;
  topicProgress: Record<Topic, TopicProgress>;
  currentLevel: Difficulty;
  isCustomMode: boolean;
  customQuestions: Question[];
  usedCustomQuestions: Set<string>;
}

interface AnsweredQuestion {
  question: Question;
  userAnswer: string;
  isCorrect: boolean;
  timestamp: Date;
}

// Define topics with proper typing
const topics: Record<Difficulty, Topic[]> = {
  easy: ["variables", "operators", "data-types", "conditionals"],
  medium: ["arrays", "objects", "functions", "loops", "scope"],
  hard: ["closures", "promises", "async-await", "prototypes", "this-keyword"],
} as const;

// Create initial topic progress with proper typing
const initialTopicProgress: Record<Topic, TopicProgress> = Object.values(
  topics
).reduce((acc, topicArray) => {
  topicArray.forEach((topic) => {
    acc[topic] = {
      total: 0,
      correct: 0,
      mastered: false,
    };
  });
  return acc;
}, {} as Record<Topic, TopicProgress>);

const initialState: QuizState = {
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  streak: 0,
  correctAnswersInRow: 0,
  difficulty: "easy",
  totalQuestions: 10,
  answeredTopics: new Set(),
  topicProgress: initialTopicProgress,
  currentLevel: "easy",
  isCustomMode: false,
  customQuestions: [],
  usedCustomQuestions: new Set(),
};

export const useQuiz = () => {
  console.log("🎣 Initializing useQuiz hook");

  const [state, setState] = useState<QuizState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<
    AnsweredQuestion[]
  >([]);

  // Load saved state from localStorage after component mounts
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("quizState");
      const savedHistory = localStorage.getItem("quizHistory");

      if (savedState) {
        const parsed = JSON.parse(savedState);
        setState({
          ...parsed,
          answeredTopics: new Set(parsed.answeredTopics || []),
          questions: parsed.questions || [],
        });
      }

      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setAnsweredQuestions(
          parsedHistory.map(
            (item: AnsweredQuestion & { timestamp: string }) => ({
              ...item,
              timestamp: new Date(item.timestamp),
            })
          )
        );
      }
    } catch (err) {
      console.error("Error loading saved state:", err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        const stateToSave = {
          ...state,
          answeredTopics: Array.from(state.answeredTopics),
        };
        localStorage.setItem("quizState", JSON.stringify(stateToSave));
        localStorage.setItem("quizHistory", JSON.stringify(answeredQuestions));
      } catch (err) {
        console.error("Error saving state:", err);
      }
    }
  }, [state, answeredQuestions, isInitialized]);

  const loadQuestion = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const getNextTopic = (): Topic => {
        const levelTopics = topics[state.difficulty];
        const randomIndex = Math.floor(Math.random() * levelTopics.length);
        return levelTopics[randomIndex];
      };

      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: getNextTopic(),
          difficulty: state.difficulty,
          excludePatterns: state.questions
            .map((q) => q.question)
            .join(" ")
            .substring(0, 100),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to load question");
      }

      const question = await response.json();

      setState((prev) => ({
        ...prev,
        questions: [question],
        currentQuestionIndex: 0,
      }));
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load question"
      );
    } finally {
      setLoading(false);
    }
  }, [state.questions, state.difficulty]);

  const handleAnswer = useCallback(
    (answer: string) => {
      const currentQuestion = state.questions[state.currentQuestionIndex];
      if (!currentQuestion) return;

      const isCorrect = answer === currentQuestion.correctAnswer;
      const topic = currentQuestion.topic;

      setState((prev) => {
        // Skip topic progress for custom quizzes or unknown topics
        if (prev.isCustomMode || !prev.topicProgress[topic]) {
          return {
            ...prev,
            score: prev.score + (isCorrect ? 100 : 0),
            streak: isCorrect ? prev.streak + 1 : 0,
            correctAnswersInRow: isCorrect ? prev.correctAnswersInRow + 1 : 0,
          };
        }

        // For known topics, update progress
        const currentProgress = prev.topicProgress[topic];
        const newProgress = {
          total: currentProgress.total + 1,
          correct: currentProgress.correct + (isCorrect ? 1 : 0),
          mastered: false,
        };

        return {
          ...prev,
          score: prev.score + (isCorrect ? 100 : 0),
          streak: isCorrect ? prev.streak + 1 : 0,
          correctAnswersInRow: isCorrect ? prev.correctAnswersInRow + 1 : 0,
          topicProgress: {
            ...prev.topicProgress,
            [topic]: newProgress,
          },
        };
      });

      setAnsweredQuestions((prev) => [
        ...prev,
        {
          question: currentQuestion,
          userAnswer: answer,
          isCorrect,
          timestamp: new Date(),
        },
      ]);
    },
    [state.currentQuestionIndex, state.questions]
  );

  const resetQuiz = useCallback(() => {
    setState(initialState);
    setAnsweredQuestions([]);
    localStorage.removeItem("quizState");
    localStorage.removeItem("quizHistory");
  }, []);

  // const submitQuiz = async (data: any) => {
  //   console.log("🚀 Starting quiz submission in hook:", data);
  //   try {
  //     // ... submission logic ...
  //     console.log("✨ Quiz submission completed in hook");
  //   } catch (error) {
  //     console.error("❌ Error in useQuiz hook:", error);
  //     throw error;
  //   }
  // };

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentQuestionIndex + 1;
      const hasNextQuestion =
        prev.questions && nextIndex < prev.questions.length;

      // If we're in custom mode and completed all questions
      if (!hasNextQuestion && prev.isCustomMode) {
        // Track the current question as used
        const currentQuestion = prev.questions[prev.currentQuestionIndex];
        const updatedUsedQuestions = new Set(prev.usedCustomQuestions);
        updatedUsedQuestions.add(currentQuestion.question);

        // If we've used all questions, reset the used questions set
        if (updatedUsedQuestions.size >= prev.customQuestions.length) {
          return {
            ...prev,
            currentQuestionIndex: 0,
            usedCustomQuestions: new Set(),
          };
        }

        // Find the next unused question
        const unusedQuestions = prev.customQuestions.filter(
          (q) => !updatedUsedQuestions.has(q.question)
        );

        if (unusedQuestions.length > 0) {
          // Randomly select an unused question
          const randomIndex = Math.floor(
            Math.random() * unusedQuestions.length
          );
          const nextQuestions = [unusedQuestions[randomIndex]];

          return {
            ...prev,
            questions: nextQuestions,
            currentQuestionIndex: 0,
            usedCustomQuestions: updatedUsedQuestions,
            totalQuestions: prev.customQuestions.length,
          };
        }
      }

      // Regular mode or has next question
      return {
        ...prev,
        currentQuestionIndex: nextIndex,
      };
    });
  }, []);

  const toggleCustomMode = useCallback(
    (enabled: boolean) => {
      setState((prev) => ({
        ...prev,
        isCustomMode: enabled,
        currentQuestionIndex: 0,
        questions: enabled ? prev.customQuestions || [] : [],
      }));

      // If switching to regular mode, load a new question
      if (!enabled) {
        loadQuestion();
      }
    },
    [loadQuestion]
  );

  const getCurrentQuestion = (state: QuizState) => {
    if (!state.questions || state.questions.length === 0) {
      return null;
    }
    return state.questions[state.currentQuestionIndex] || null;
  };

  const setDifficulty = useCallback(
    (newDifficulty: Difficulty) => {
      setState((prev) => ({
        ...prev,
        difficulty: newDifficulty,
        currentQuestionIndex: 0,
        questions: [],
      }));
      loadQuestion();
    },
    [loadQuestion]
  );

  return {
    currentQuestion: getCurrentQuestion(state),
    score: state.score,
    streak: state.streak,
    difficulty: state.difficulty,
    correctAnswersInRow: state.correctAnswersInRow,
    loading,
    setLoading,
    error,
    setError,
    loadQuestion,
    handleAnswer,
    resetQuiz,
    nextQuestion,
    questionNumber: state.currentQuestionIndex + 1,
    totalQuestions: state.totalQuestions,
    answeredQuestions,
    currentLevel: state.currentLevel,
    topicProgress: state.topicProgress,
    setState,
    isCustomMode: state.isCustomMode,
    toggleCustomMode,
    setDifficulty,
    // submitQuiz,
  };
};
