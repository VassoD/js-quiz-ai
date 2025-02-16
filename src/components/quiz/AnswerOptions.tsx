import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

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
  const renderOptionContent = (option: string) => {
    // Check if the option is wrapped in backticks
    const codeMatch = option.match(/^`(.+)`$/);
    if (codeMatch) {
      return (
        <SyntaxHighlighter
          language="javascript"
          style={oneDark}
          customStyle={{
            background: "transparent",
            padding: "0.5rem",
            margin: 0,
            fontSize: "0.875rem",
          }}
        >
          {codeMatch[1]}
        </SyntaxHighlighter>
      );
    }
    return option;
  };

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
            aria-label={option.replace(/`/g, "")}
          >
            <div className="flex items-start gap-3">
              <span className="text-sm font-medium px-2.5 py-1.5 bg-muted/50 rounded-md shrink-0">
                {String.fromCharCode(65 + index)}
              </span>
              <div className="flex-1">{renderOptionContent(option)}</div>
            </div>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
