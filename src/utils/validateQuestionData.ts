import { Question, Topic } from "@/types/quiz";
import { isSimilarQuestion } from "./isSimilarQuestion";
// import { isValidDifficulty, isValidTopic } from "./validators";

export function validateQuestionData(
  data: Question,
  excludePatterns?: string,
  isCustomQuiz = false
): Question {
  console.log("Validating question data:", data);

  if (!data || typeof data !== "object") {
    throw new Error("Invalid question data format");
  }

  const partialQuestion = { ...data };

  if (
    !("question" in partialQuestion) ||
    typeof partialQuestion.question !== "string"
  ) {
    throw new Error("Missing or invalid question field");
  }

  if (
    !("options" in partialQuestion) ||
    !Array.isArray(partialQuestion.options)
  ) {
    throw new Error("Missing or invalid options array");
  }

  if (
    partialQuestion.options.length < 3 ||
    partialQuestion.options.length > 4
  ) {
    throw new Error("Options must contain 3 or 4 items");
  }

  if (
    excludePatterns &&
    isSimilarQuestion(partialQuestion.question, excludePatterns)
  ) {
    throw new Error("Question is too similar to previous questions");
  }

  // Clean up options and correct answer by removing any prefixes and trimming
  const options = partialQuestion.options.map((opt: unknown) => {
    if (typeof opt !== "string") {
      throw new Error("All options must be strings");
    }
    return opt.trim();
  });

  // Validate that correctAnswer exactly matches one of the options
  if (!options.includes(partialQuestion.correctAnswer)) {
    console.log("Available options:", JSON.stringify(options));
    console.log(
      "Correct answer:",
      JSON.stringify(partialQuestion.correctAnswer)
    );
    throw new Error("The correctAnswer must exactly match one of the options");
  }

  let code: string | null = null;
  if ("code" in partialQuestion && partialQuestion.code) {
    if (typeof partialQuestion.code !== "string") {
      throw new Error("Code must be a string if provided");
    }
    code = partialQuestion.code.replace(/\/\/ .*$/gm, "").trim() || null;
  }

  // Validate topic is one of the allowed values
  const validTopics = [
    "variables",
    "operators",
    "data-types",
    "conditionals",
    "arrays",
    "objects",
    "functions",
    "loops",
    "scope",
    "closures",
    "promises",
    "async-await",
    "prototypes",
    "this-keyword",
  ];

  // Skip topic validation for custom quizzes
  if (!isCustomQuiz) {
    const topicString = data.topic.split(",")[0].trim();
    if (!validTopics.includes(topicString)) {
      throw new Error(
        `Invalid topic: ${topicString}. Must be one of: ${validTopics.join(
          ", "
        )}`
      );
    }
  }

  return {
    question: partialQuestion.question,
    code,
    options,
    correctAnswer: partialQuestion.correctAnswer,
    explanation: partialQuestion.explanation,
    topic: isCustomQuiz ? data.topic : (data.topic as Topic),
    difficulty: partialQuestion.difficulty,
  };
}
