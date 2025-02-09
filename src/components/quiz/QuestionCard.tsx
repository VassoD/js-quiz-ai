import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from "@/types/quiz";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { StatsDisplay } from "./StatsDisplay";
import { CodeBlock } from "./CodeBlock";
import { AnswerOptions } from "./AnswerOptions";
import { FeedbackSection } from "./FeedbackSection";
import { useEffect } from "react";

interface QuestionCardProps {
  currentQuestion: Question;
  score: number;
  streak: number;
  difficulty: string;
  correctAnswersInRow: number;
  showExplanation: boolean;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  onNextQuestion: () => void;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionCard({
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
}: QuestionCardProps) {
  const progress = (questionNumber / totalQuestions) * 100;

  useEffect(() => {
    console.log("Rendering CodeBlock with:", currentQuestion.code);
  }, [currentQuestion.code]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-xl">
        <CardHeader className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-medium">
                  Question {questionNumber} of {totalQuestions}
                </span>
                {streak >= 3 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm font-medium">Hot Streak!</span>
                  </div>
                )}
              </div>
            </div>
            <Progress value={progress} className="h-2 bg-gray-700" />
          </div>

          <StatsDisplay
            score={score}
            streak={streak}
            difficulty={difficulty}
            correctAnswersInRow={correctAnswersInRow}
          />

          <CardTitle className="text-2xl font-bold">
            {currentQuestion?.question}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          {currentQuestion?.code && (
            <div
              className="w-full overflow-x-auto rounded-lg bg-gray-900/50"
              tabIndex={0}
            >
              <CodeBlock code={currentQuestion.code} language="javascript" />
            </div>
          )}

          <AnswerOptions
            options={currentQuestion?.options}
            correctAnswer={currentQuestion?.correctAnswer}
            selectedAnswer={selectedAnswer}
            showExplanation={showExplanation}
            onAnswerSelect={onAnswerSelect}
          />

          {showExplanation && (
            <FeedbackSection
              selectedAnswer={selectedAnswer}
              currentQuestion={currentQuestion}
              difficulty={difficulty}
              correctAnswersInRow={correctAnswersInRow}
              onNextQuestion={onNextQuestion}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
