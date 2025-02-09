import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from "@/types/quiz";
import { CheckCircle2, XCircle } from "lucide-react";

interface HistoryCardProps {
  answeredQuestions: {
    question: Question;
    userAnswer: string;
    isCorrect: boolean;
    timestamp: Date;
  }[];
}

export function HistoryCard({ answeredQuestions }: HistoryCardProps) {
  return (
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-lg dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
          Question History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {answeredQuestions.map((item, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              {item.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-1" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-1" />
              )}
              <div className="space-y-2 flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {item.question.question}
                </p>
                <div className="text-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    Your answer: {item.userAnswer}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Correct answer: {item.question.correctAnswer}
                  </p>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
