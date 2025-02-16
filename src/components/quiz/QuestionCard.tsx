import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from "@/types/quiz";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { StatsDisplay } from "./StatsDisplay";
import { AnswerOptions } from "./AnswerOptions";
import { FeedbackSection } from "./FeedbackSection";
import { memo, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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

const syntaxHighlighterStyle = {
  background: "rgba(0, 0, 0, 0.2)",
  padding: "1rem",
  borderRadius: "0.5rem",
  fontSize: "0.875rem",
} as const;

const QuestionHeader = memo(
  ({
    questionNumber,
    totalQuestions,
    streak,
    progress,
  }: {
    questionNumber: number;
    totalQuestions: number;
    streak: number;
    progress: number;
  }) => (
    <div className="space-y-6">
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
    </div>
  )
);
QuestionHeader.displayName = "QuestionHeader";

const CodeDisplay = memo(({ code }: { code: string }) => (
  <SyntaxHighlighter
    language="javascript"
    style={vscDarkPlus}
    showLineNumbers
    customStyle={syntaxHighlighterStyle}
  >
    {code}
  </SyntaxHighlighter>
));
CodeDisplay.displayName = "CodeDisplay";

export const QuestionCard = memo(function QuestionCard({
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
  const progress = useMemo(
    () => (questionNumber / totalQuestions) * 100,
    [questionNumber, totalQuestions]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/10 shadow-xl">
        <CardHeader className="space-y-6">
          <QuestionHeader
            questionNumber={questionNumber}
            totalQuestions={totalQuestions}
            streak={streak}
            progress={progress}
          />

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
          {currentQuestion?.code && <CodeDisplay code={currentQuestion.code} />}

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
});
