import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Target, Trophy } from "lucide-react";

interface ProgressStatsProps {
  totalQuestions: number;
  correctAnswers: number;
  topicsProgress: Record<string, { total: number; correct: number }>;
}

export function ProgressStats({
  totalQuestions,
  correctAnswers,
  topicsProgress,
}: ProgressStatsProps) {
  const accuracy =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-lg dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Accuracy
                </p>
                <p className="font-bold text-lg text-gray-900 dark:text-white">
                  {accuracy.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Questions
                </p>
                <p className="font-bold text-lg text-gray-900 dark:text-white">
                  {totalQuestions}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Correct
                </p>
                <p className="font-bold text-lg text-gray-900 dark:text-white">
                  {correctAnswers}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Topics Progress
          </h3>
          {Object.entries(topicsProgress).map(([topic, progress]) => (
            <div key={topic} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300 capitalize">
                  {topic}
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {progress.correct}/{progress.total}
                </span>
              </div>
              <Progress
                value={(progress.correct / progress.total) * 100}
                className="h-2.5 bg-gray-200 dark:bg-gray-600"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
