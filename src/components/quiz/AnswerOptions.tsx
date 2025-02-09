import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface AnswerOptionsProps {
  options: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  showExplanation: boolean;
  onAnswerSelect: (answer: string) => void;
}

export function AnswerOptions({
  options,
  correctAnswer,
  selectedAnswer,
  showExplanation,
  onAnswerSelect,
}: AnswerOptionsProps) {
  return (
    <div className="grid grid-cols-1 gap-3" role="radiogroup">
      {options.map((option, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button
            onClick={() => onAnswerSelect(option)}
            disabled={showExplanation}
            variant={
              showExplanation
                ? option === correctAnswer
                  ? "default"
                  : option === selectedAnswer
                  ? "destructive"
                  : "outline"
                : "outline"
            }
            className={`w-full text-left justify-start p-6 h-auto transition-colors
              ${
                showExplanation && option === correctAnswer
                  ? "bg-green-600 hover:bg-green-600 text-white font-medium"
                  : showExplanation && option === selectedAnswer
                  ? "bg-red-600 text-white border-red-700"
                  : "hover:bg-muted bg-background text-foreground border"
              }`}
            role="radio"
            aria-checked={option === selectedAnswer}
            aria-label={option}
          >
            <span className="mr-3 text-sm font-medium px-2.5 py-1.5 bg-muted/50 rounded-md">
              {String.fromCharCode(65 + index)}
            </span>
            {option}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
