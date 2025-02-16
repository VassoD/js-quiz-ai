import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Difficulty } from "@/types/quiz";

interface CodeReviewInputProps {
  onSubmit: (data: { reviewData: string; difficulty: Difficulty }) => void;
  isLoading: boolean;
}

interface DifficultyButtonProps {
  difficulty: Difficulty;
  selected: boolean;
  onClick: (difficulty: Difficulty) => void;
}

const DifficultyButton = ({
  difficulty,
  selected,
  onClick,
}: DifficultyButtonProps) => (
  <Button
    variant={selected ? "default" : "outline"}
    onClick={() => onClick(difficulty)}
    className={`capitalize ${selected ? "bg-primary" : ""}`}
  >
    {difficulty}
  </Button>
);

export function CodeReviewInput({ onSubmit, isLoading }: CodeReviewInputProps) {
  const [reviewData, setReviewData] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("easy");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ reviewData, difficulty: selectedDifficulty });
  };

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-xl">
      <CardHeader>
        <CardTitle>Generate Quiz from Code Reviews</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <DifficultyButton
              difficulty="easy"
              selected={selectedDifficulty === "easy"}
              onClick={setSelectedDifficulty}
            />
            <DifficultyButton
              difficulty="medium"
              selected={selectedDifficulty === "medium"}
              onClick={setSelectedDifficulty}
            />
            <DifficultyButton
              difficulty="hard"
              selected={selectedDifficulty === "hard"}
              onClick={setSelectedDifficulty}
            />
          </div>

          <textarea
            placeholder="Paste your code review comments here..."
            value={reviewData}
            onChange={(e) => setReviewData(e.target.value)}
            className="min-h-[200px] w-full bg-gray-900/50 rounded-md border border-gray-700 p-3 text-sm"
          />
          <Button
            type="submit"
            disabled={isLoading || !reviewData.trim()}
            className="w-full"
          >
            {isLoading ? "Generating Quiz..." : "Generate Quiz"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
