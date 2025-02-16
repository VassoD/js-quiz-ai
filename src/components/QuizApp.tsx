"use client";

import React, { useState, useEffect } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { QuestionCard } from "./quiz/QuestionCard";
import { LoadingCard } from "./quiz/LoadingCard";
import { ErrorCard } from "./quiz/ErrorCard";
import { HistoryCard } from "./quiz/HistoryCard";
import { ProgressStats } from "./quiz/ProgressStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BookOpen, BarChart2, History, FileText } from "lucide-react";
import { CodeReviewInput } from "./quiz/CodeReviewInput";
import { Switch } from "./ui/switch";
import { DifficultyButton } from "./quiz/DifficultyButton";

export default function QuizApp() {
  const {
    currentQuestion,
    score,
    streak,
    difficulty,
    loading,
    setLoading,
    error,
    setError,
    loadQuestion,
    handleAnswer,
    correctAnswersInRow,
    nextQuestion,
    questionNumber,
    totalQuestions,
    answeredQuestions,
    resetQuiz,
    setState,
    isCustomMode,
    toggleCustomMode,
    setDifficulty,
  } = useQuiz();

  const [mounted, setMounted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!currentQuestion) {
      loadQuestion();
    }
  }, [currentQuestion, loadQuestion]);

  if (!mounted) return null;
  if (loading) return <LoadingCard />;
  if (error) return <ErrorCard error={error} onRetry={loadQuestion} />;
  if (!currentQuestion) return null;

  const onAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    handleAnswer(answer);
    setShowExplanation(true);
  };

  const onNextQuestion = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    nextQuestion();
  };

  const topicsProgress = answeredQuestions.reduce((acc, curr) => {
    const topic = curr.question.topic;
    if (!acc[topic]) {
      acc[topic] = { total: 0, correct: 0 };
    }
    acc[topic].total++;
    if (curr.isCorrect) {
      acc[topic].correct++;
    }
    return acc;
  }, {} as Record<string, { total: number; correct: number }>);

  const questionCardProps = {
    currentQuestion,
    score,
    streak,
    difficulty,
    correctAnswersInRow,
    showExplanation,
    selectedAnswer,
    onAnswerSelect,
    onNextQuestion,
    questionNumber,
    totalQuestions,
  };

  const progressProps = {
    totalQuestions: answeredQuestions.length,
    correctAnswers: answeredQuestions.filter((q) => q.isCorrect).length,
    topicsProgress,
  };

  return (
    <Tabs defaultValue="quiz" className="w-full h-screen flex">
      <div className="w-80 h-full border-r border-border/10 bg-card/95 backdrop-blur-xl">
        <div className="p-8 flex flex-col h-full">
          <div className="shrink-0 flex items-center gap-3 mb-12">
            <div className="p-2 rounded-xl bg-primary/10">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">JS Quiz</h1>
          </div>

          {/* Navigation section */}
          <nav className="flex-1">
            <TabsList className="flex flex-col w-full gap-2 bg-transparent h-auto">
              <TabsTrigger
                value="quiz"
                className="relative w-full justify-start p-4 text-left rounded-xl transition-all
                  data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                  data-[state=inactive]:hover:bg-muted
                  group"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 group-data-[state=active]:text-primary-foreground/90" />
                  <span className="font-medium">Quiz</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="w-full justify-start p-4 text-left rounded-xl transition-all
                  data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                  data-[state=inactive]:hover:bg-muted
                  group"
              >
                <div className="flex items-center gap-3">
                  <BarChart2 className="w-5 h-5 group-data-[state=active]:text-primary-foreground/90" />
                  <span className="font-medium">Progress</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="w-full justify-start p-4 text-left rounded-xl transition-all
                  data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                  data-[state=inactive]:hover:bg-muted
                  group"
              >
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 group-data-[state=active]:text-primary-foreground/90" />
                  <span className="font-medium">History</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="custom"
                className="w-full justify-start p-4 text-left rounded-xl transition-all
                  data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                  data-[state=inactive]:hover:bg-muted
                  group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 group-data-[state=active]:text-primary-foreground/90" />
                  <span className="font-medium">Custom Quiz</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 h-full overflow-y-auto bg-gradient-to-br from-muted/50 via-background to-muted/50">
        <div className="max-w-4xl mx-auto p-8">
          <TabsContent value="quiz" className="mt-0 focus-visible:outline-none">
            <div className="space-y-4">
              <div className="flex gap-2">
                <DifficultyButton
                  difficulty="easy"
                  selected={difficulty === "easy"}
                  onClick={setDifficulty}
                />
                <DifficultyButton
                  difficulty="medium"
                  selected={difficulty === "medium"}
                  onClick={setDifficulty}
                />
                <DifficultyButton
                  difficulty="hard"
                  selected={difficulty === "hard"}
                  onClick={setDifficulty}
                />
              </div>
              <TooltipProvider>
                <QuestionCard {...questionCardProps} />
              </TooltipProvider>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="mt-0">
            <ProgressStats {...progressProps} />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">History</h2>
                <button
                  onClick={resetQuiz}
                  className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  Clear History
                </button>
              </div>
              <HistoryCard answeredQuestions={answeredQuestions} />
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-0">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Custom Code Review Quiz</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {isCustomMode ? "Custom Mode" : "Regular Mode"}
                  </span>
                  <Switch
                    checked={isCustomMode}
                    onCheckedChange={toggleCustomMode}
                    className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-gray-400"
                  />
                </div>
              </div>
              <CodeReviewInput
                onSubmit={async ({ reviewData, difficulty }) => {
                  try {
                    setLoading(true);
                    const response = await fetch("/api/quiz/custom", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ reviewData, difficulty }),
                    });

                    if (!response.ok) {
                      throw new Error("Failed to generate quiz");
                    }

                    const customQuestions = await response.json();
                    setState((prev) => ({
                      ...prev,
                      customQuestions,
                      questions: isCustomMode
                        ? customQuestions
                        : prev.questions,
                      currentQuestionIndex: 0,
                      totalQuestions: customQuestions.length,
                      difficulty,
                    }));
                  } catch (error) {
                    console.error("Error generating custom quiz:", error);
                    setError(
                      "Failed to generate custom quiz. Please try again."
                    );
                  } finally {
                    setLoading(false);
                  }
                }}
                isLoading={loading}
              />
            </div>
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
}
