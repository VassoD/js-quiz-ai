export type Topic =
  | "variables"
  | "operators"
  | "data-types"
  | "conditionals"
  | "arrays"
  | "objects"
  | "functions"
  | "loops"
  | "scope"
  | "closures"
  | "promises"
  | "async-await"
  | "prototypes"
  | "this-keyword";

export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  question: string;
  code: string | null;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: Topic;
  difficulty: Difficulty;
}

export interface QuestionRequest {
  topic: Topic;
  difficulty: Difficulty;
  excludePatterns?: string;
}
