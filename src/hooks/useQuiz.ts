// src/hooks/useQuiz.ts
import { useState, useCallback, useEffect, useRef } from "react";
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

  // Add a ref to track the last request time
  const lastRequestTime = useRef<number>(0);
  const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests

  // Add a new state for rate limit waiting
  const [isWaiting, setIsWaiting] = useState(false);

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
    // Add check for custom mode
    if (state.isCustomMode && state.customQuestions.length > 0) {
      // Use existing custom questions instead of loading new ones
      const randomIndex = Math.floor(
        Math.random() * state.customQuestions.length
      );
      setState((prev) => ({
        ...prev,
        questions: [state.customQuestions[randomIndex]],
        currentQuestionIndex: 0,
        error: null,
      }));
      return;
    }

    try {
      // Check if enough time has passed since last request
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime.current;

      if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
        setIsWaiting(true);
        const waitTime = RATE_LIMIT_DELAY - timeSinceLastRequest;
        console.log(`Waiting ${waitTime}ms before next request...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        setIsWaiting(false);
      }

      setLoading(true);
      setError(null);

      // Update last request time
      lastRequestTime.current = Date.now();

      const getNextTopic = (): Topic => {
        // Ensure we're using the correct difficulty level
        const levelTopics = topics[state.difficulty];
        if (!levelTopics || levelTopics.length === 0) {
          throw new Error(
            `No topics found for difficulty: ${state.difficulty}`
          );
        }
        const randomIndex = Math.floor(Math.random() * levelTopics.length);
        return levelTopics[randomIndex];
      };

      // Add validation to ensure we have a valid difficulty and topic
      const selectedTopic = getNextTopic();
      if (!selectedTopic || !state.difficulty) {
        throw new Error("Invalid topic or difficulty");
      }

      // // Clean and format the exclude patterns
      // const excludePatterns = state.questions
      //   .slice(-3)
      //   .map((q) => q.question)
      //   .map((question) =>
      //     // Remove special characters and escape quotes
      //     question
      //       .replace(/[\n\r\t]/g, " ")
      //       .replace(/"/g, '\\"')
      //       .trim()
      //   )
      //   .join(" ")
      //   .substring(0, 100);

      const requestBody = {
        topic: selectedTopic,
        difficulty: state.difficulty,
        // excludePatterns,
      };

      console.log("Sending request with:", requestBody);

      try {
        const response = await fetch("/api/quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("Failed to parse response:", parseError);
          throw new Error("Server returned invalid JSON");
        }

        // Check for error responses first
        if (!response.ok) {
          const errorDetails = {
            status: response.status,
            statusText: response.statusText,
            data: data || "No error data",
          };

          console.error("Server error details:", errorDetails);

          // Try to extract a meaningful error message
          let errorMessage = "Unknown server error";
          if (typeof data === "object" && data !== null) {
            errorMessage =
              data.error ||
              data.message ||
              `Error ${response.status}: ${response.statusText}`;
          } else if (typeof data === "string") {
            errorMessage = data;
          }

          throw new Error(errorMessage);
        }

        // Validate the response data
        if (!data || typeof data !== "object") {
          console.error("Invalid data structure received:", data);
          throw new Error("Server returned invalid data structure");
        }

        if (!data.topic || !data.difficulty || !data.question) {
          console.error("Missing required fields in response:", data);
          throw new Error("Server returned incomplete question data");
        }

        // Validate difficulty match
        if (data.difficulty !== state.difficulty) {
          console.error("Difficulty mismatch:", {
            expected: state.difficulty,
            received: data.difficulty,
          });
          throw new Error(
            `Received question with wrong difficulty: ${data.difficulty}`
          );
        }

        console.log("Successfully loaded question:", {
          topic: data.topic,
          difficulty: data.difficulty,
        });

        setState((prev) => ({
          ...prev,
          questions: [data],
          currentQuestionIndex: 0,
          error: null,
        }));
      } catch (fetchError) {
        console.error("Fetch error details:", {
          error: fetchError,
          message:
            fetchError instanceof Error
              ? fetchError.message
              : String(fetchError),
        });

        throw new Error(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to communicate with server"
        );
      }
    } catch (error) {
      console.error("Error in loadQuestion:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load question"
      );
      setState((prev) => ({
        ...prev,
        questions: [],
        currentQuestionIndex: 0,
      }));
    } finally {
      setLoading(false);
    }
  }, [state.difficulty, state.isCustomMode, state.customQuestions]);

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

      if (!hasNextQuestion) {
        // If no next question, trigger a load with rate limiting
        loadQuestion();
        return prev;
      }

      return {
        ...prev,
        currentQuestionIndex: nextIndex,
      };
    });
  }, [loadQuestion]);

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
        score: 0,
        streak: 0,
        correctAnswersInRow: 0,
        error: null,
        loading: false,
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
    isWaiting,
    // submitQuiz,
  };
};
