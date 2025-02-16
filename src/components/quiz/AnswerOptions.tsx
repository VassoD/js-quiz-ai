import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useMemo } from "react";

interface AnswerOptionsProps {
  options: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  showExplanation: boolean;
  onAnswerSelect: (answer: string) => void;
}

const syntaxHighlighterStyle = {
  background: "transparent",
  padding: "0.5rem",
  margin: 0,
  fontSize: "0.875rem",
} as const;

export function AnswerOptions({
  options,
  correctAnswer,
  selectedAnswer,
  showExplanation,
  onAnswerSelect,
}: AnswerOptionsProps) {
  const renderOptionContent = useMemo(() => {
    const render = (option: string) => {
      const codeMatch = option.match(/^`(.+)`$/);
      if (codeMatch) {
        return (
          <SyntaxHighlighter
            language="javascript"
            style={vscDarkPlus}
            customStyle={syntaxHighlighterStyle}
          >
            {codeMatch[1]}
          </SyntaxHighlighter>
        );
      }
      return option;
    };
    render.displayName = "RenderOptionContent";
    return render;
  }, []);

  const getButtonVariant = (option: string) => {
    if (!showExplanation) return "outline";
    if (option === correctAnswer) return "default";
    if (option === selectedAnswer) return "destructive";
    return "outline";
  };

  const getButtonClassName = (option: string) => {
    const baseClasses =
      "w-full text-left justify-start p-6 h-auto transition-colors";
    if (!showExplanation)
      return `${baseClasses} hover:bg-muted bg-background text-foreground border`;
    if (option === correctAnswer)
      return `${baseClasses} bg-green-600 hover:bg-green-600 text-white font-medium`;
    if (option === selectedAnswer)
      return `${baseClasses} bg-red-600 text-white border-red-700`;
    return `${baseClasses} hover:bg-muted bg-background text-foreground border`;
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
            variant={getButtonVariant(option)}
            className={getButtonClassName(option)}
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
