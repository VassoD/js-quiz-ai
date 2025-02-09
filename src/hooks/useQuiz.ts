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

  const isLevelComplete = useCallback(
    (level: Difficulty): boolean => {
      const levelTopics = topics[level];
      return levelTopics.every(
        (topic) => state.topicProgress[topic]?.mastered ?? false
      );
    },
    [state.topicProgress]
  );

  const updateTopicProgress = useCallback(
    (topic: Topic, isCorrect: boolean) => {
      setState((prev) => {
        const currentProgress = prev.topicProgress[topic];
        const newProgress = {
          total: currentProgress.total + 1,
          correct: currentProgress.correct + (isCorrect ? 1 : 0),
          mastered: false,
        };

        // Topic is mastered if accuracy is >= 80% with at least 3 questions answered
        newProgress.mastered =
          newProgress.total >= 3 &&
          newProgress.correct / newProgress.total >= 0.8;

        // Check if should advance to next level
        let newLevel = prev.currentLevel;
        if (isLevelComplete(prev.currentLevel)) {
          if (prev.currentLevel === "easy") newLevel = "medium";
          else if (prev.currentLevel === "medium") newLevel = "hard";
        }

        return {
          ...prev,
          topicProgress: {
            ...prev.topicProgress,
            [topic]: newProgress,
          },
          currentLevel: newLevel,
        };
      });
    },
    [isLevelComplete]
  );

  const loadQuestion = useCallback(async () => {
    console.log("🎯 Starting loadQuestion");

    if (state.questions[state.currentQuestionIndex]) {
      console.log("⏭️ Question already exists for current index");
      return;
    }

    try {
      setLoading(true);
      const newDifficulty = state.currentLevel;
      const answeredTopics = state.answeredTopics || new Set<Topic>();

      console.log("📊 Current state before fetch:", {
        difficulty: newDifficulty,
        answeredTopics: Array.from(answeredTopics),
        currentIndex: state.currentQuestionIndex,
        questionsCount: state.questions.length,
      });

      const levelTopics = topics[newDifficulty];

      // If all topics in current level are mastered, move to next level
      if (levelTopics.every((topic) => state.topicProgress[topic]?.mastered)) {
        setState((prev) => ({
          ...prev,
          currentLevel:
            prev.currentLevel === "easy"
              ? "medium"
              : prev.currentLevel === "medium"
              ? "hard"
              : "hard",
          answeredTopics: new Set(), // Reset answered topics for new level
        }));
        return; // Return and let next render trigger new question load
      }

      const appropriateTopics = levelTopics.filter(
        (topic) => !answeredTopics.has(topic)
      );

      // If all topics have been used, reset the set and try again
      if (appropriateTopics.length === 0) {
        answeredTopics.clear();
        appropriateTopics.push(...levelTopics);
      }

      // Pick a random topic, avoiding the last one if possible
      let randomTopic: Topic;
      if (appropriateTopics.length > 1 && state.lastQuestionType) {
        randomTopic =
          appropriateTopics.find((t) => t !== state.lastQuestionType) ??
          appropriateTopics[0];
      } else {
        randomTopic =
          appropriateTopics[
            Math.floor(Math.random() * appropriateTopics.length)
          ];
      }

      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: randomTopic,
          difficulty: newDifficulty,
          excludePatterns: state.questions.map((q) => q.question).join(","),
        }),
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        const waitTime = (parseInt(retryAfter || "5") + 1) * 1000;
        setError(
          `Rate limit reached. Please wait ${Math.ceil(
            waitTime / 1000
          )} seconds before trying again.`
        );
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch question");
      }

      const newQuestion: Question = await response.json();
      console.log("📥 Received new question:", newQuestion);

      setState((prev) => ({
        ...prev,
        questions: [...prev.questions, newQuestion],
        difficulty: newDifficulty,
        answeredTopics: new Set([...answeredTopics, randomTopic]),
        lastQuestionType: randomTopic,
      }));
    } catch (err) {
      console.error("❌ Error in loadQuestion:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load question. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [
    state.questions,
    state.currentQuestionIndex,
    state.answeredTopics,
    state.lastQuestionType,
    state.currentLevel,
    state.topicProgress,
  ]);

  const handleAnswer = useCallback(
    (answer: string) => {
      const currentQ = state.questions[state.currentQuestionIndex];
      const isCorrect = answer === currentQ?.correctAnswer;

      // Update topic progress
      updateTopicProgress(currentQ.topic, isCorrect);

      // Update answered questions history
      setAnsweredQuestions((prev) => [
        ...prev,
        {
          question: currentQ,
          userAnswer: answer,
          isCorrect,
          timestamp: new Date(),
        },
      ]);

      setState((prev) => ({
        ...prev,
        correctAnswersInRow: isCorrect ? prev.correctAnswersInRow + 1 : 0,
        streak: isCorrect ? prev.streak + 1 : 0,
        score: isCorrect
          ? prev.score + calculatePoints(prev.difficulty, prev.streak)
          : prev.score,
      }));
    },
    [state.currentQuestionIndex, state.questions, updateTopicProgress]
  );

  const calculatePoints = (
    difficulty: Difficulty,
    currentStreak: number
  ): number => {
    const basePoints = {
      easy: 100,
      medium: 200,
      hard: 300,
    }[difficulty];

    const streakBonus = currentStreak * 10;
    return basePoints + streakBonus;
  };

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
    console.log("⏭️ Moving to next question", {
      currentIndex: state.currentQuestionIndex,
      totalQuestions: state.questions.length,
    });

    setState((prev) => {
      const nextIndex = prev.currentQuestionIndex + 1;
      console.log("📊 Next question state", {
        nextIndex,
        hasNextQuestion: !!prev.questions[nextIndex],
      });
      return {
        ...prev,
        currentQuestionIndex: nextIndex,
      };
    });
  }, [state.currentQuestionIndex, state.questions.length]);

  return {
    currentQuestion: state.questions[state.currentQuestionIndex],
    score: state.score,
    streak: state.streak,
    difficulty: state.difficulty,
    correctAnswersInRow: state.correctAnswersInRow,
    loading,
    error,
    loadQuestion,
    handleAnswer,
    resetQuiz,
    nextQuestion,
    questionNumber: state.currentQuestionIndex + 1,
    totalQuestions: state.totalQuestions,
    answeredQuestions,
    currentLevel: state.currentLevel,
    topicProgress: state.topicProgress,
    // submitQuiz,
  };
};
