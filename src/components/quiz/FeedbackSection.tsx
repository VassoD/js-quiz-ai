import { getFeedbackMessage, getProgressFeedback } from "@/utils/feedback";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Question } from "@/types/quiz";
import { Button } from "@/components/ui/button";

interface FeedbackSectionProps {
  selectedAnswer: string | null;
  currentQuestion: Question;
  difficulty: string;
  correctAnswersInRow: number;
  onNextQuestion: () => void;
}

interface ExplanationSectionProps {
  currentQuestion: Question;
  selectedAnswer: string | null;
  onNextQuestion: () => void;
}

export function FeedbackSection({
  selectedAnswer,
  currentQuestion,
  difficulty,
  correctAnswersInRow,
  onNextQuestion,
}: FeedbackSectionProps) {
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  return (
    <div className="space-y-4">
      <div
        className={`p-6 rounded-xl ${
          isCorrect
            ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-800"
        }`}
      >
        <div className="flex items-start gap-3">
          {isCorrect ? (
            <CheckCircle2 className="w-6 h-6 text-green-600 mt-1" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 mt-1" />
          )}
          <div className="space-y-2">
            <p className="font-semibold text-slate-800">
              {getFeedbackMessage(isCorrect, difficulty)}
            </p>
            {isCorrect && (
              <p className="text-green-700">
                {getProgressFeedback(correctAnswersInRow)}
              </p>
            )}
          </div>
        </div>
      </div>

      <ExplanationSection
        currentQuestion={currentQuestion}
        selectedAnswer={selectedAnswer}
        onNextQuestion={onNextQuestion}
      />
    </div>
  );
}

function ExplanationSection({
  currentQuestion,
  selectedAnswer,
  onNextQuestion,
}: ExplanationSectionProps) {
  return (
    <div className="bg-white p-6 rounded-xl space-y-4 border border-gray-100 shadow-sm">
      <div>
        <p className="font-semibold text-slate-800 mb-2">
          Detailed Explanation:
        </p>
        <p className="text-slate-700 leading-relaxed">
          {currentQuestion?.explanation}
        </p>
      </div>

      {selectedAnswer !== currentQuestion?.correctAnswer && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="font-semibold text-blue-800 mb-1">Pro Tip:</p>
          <p className="text-blue-700">
            Remember to {currentQuestion?.topic.toLowerCase()} concepts. Try
            practicing with similar examples to reinforce your understanding.
          </p>
        </div>
      )}

      <Button
        onClick={onNextQuestion}
        className="w-full bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-medium"
      >
        <ArrowRight className="w-4 h-4 mr-2" />
        Next Question
      </Button>
    </div>
  );
}
