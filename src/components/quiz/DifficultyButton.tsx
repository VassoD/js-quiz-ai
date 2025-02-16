import { Button } from "@/components/ui/button";
import { Difficulty } from "@/types/quiz";

interface DifficultyButtonProps {
  difficulty: Difficulty;
  selected: boolean;
  onClick: (difficulty: Difficulty) => void;
}

export function DifficultyButton({
  difficulty,
  selected,
  onClick,
}: DifficultyButtonProps) {
  return (
    <Button
      variant={selected ? "default" : "outline"}
      onClick={() => onClick(difficulty)}
      className={`capitalize ${selected ? "bg-primary" : ""}`}
    >
      {difficulty}
    </Button>
  );
}
