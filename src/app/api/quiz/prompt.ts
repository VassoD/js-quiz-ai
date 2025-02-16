import { Difficulty, Topic } from "@/types/quiz";

export function generatePrompt(
  topic: Topic,
  difficulty: Difficulty,
  excludePatterns?: string
): string {
  const questionStyles = [
    "Explain what happens in this code",
    "Fix the bug in this code",
    "What is the output of this code",
    "Which best practice is demonstrated",
    "What would improve this code",
    "Identify the potential issue",
    "Complete the code to achieve",
    "Why does this code behave differently than",
    "How would you optimize this code",
    "What is the key concept illustrated by",
  ];

  const randomIndex = Math.floor(Math.random() * questionStyles.length);
  const randomStyle = questionStyles[randomIndex];

  return `Generate a unique JavaScript quiz question using this style: "${randomStyle}".
    Topic: ${topic}
    Difficulty: ${difficulty}
    ${excludePatterns ? `Previous questions to avoid: ${excludePatterns}` : ""}
  
    Return ONLY valid JSON with this EXACT structure:
    {
      "question": "Clear, specific question about the concept",
      "code": "const example = 'valid JavaScript code';\\nmore code if needed;",
      "options": [
        "First option - correct answer",
        "Second option - wrong answer",
        "Third option - wrong answer",
        "Fourth option - wrong answer"
      ],
      "correctAnswer": "COPY-PASTE one of the options exactly",
      "explanation": "Clear explanation of why the answer is correct and others are wrong",
      "topic": "${topic}",
      "difficulty": "${difficulty}"
    }
  
    IMPORTANT RULES:
    1. Question must be unique and different from previous questions
    2. Focus on practical, real-world scenarios
    3. Include edge cases for medium/hard difficulty
    4. Make options distinctly different
    5. Include meaningful code examples
    6. Match the difficulty level appropriately:
       - easy: basic concepts
       - medium: combined concepts
       - hard: advanced patterns
    7. The correctAnswer field MUST be an exact string copy of one of the options
    8. Do not add prefixes (A), B), etc.) to options
    9. Do not combine multiple options into one answer
    10. Each option should be a complete, standalone answer
    11. MUST provide EXACTLY 4 options - no more, no less
  
    Example of INCORRECT format:
    ❌ options: ["12", "65", "18", "70", "55"]  // Wrong - has 5 options
    ❌ correctAnswer: "12 and 65"  // Wrong - combines options
  
    Example of CORRECT format:
    ✓ options: [
      "Age under 12 or over 65",
      "Age under 18",
      "Age over 21",
      "None of the above"
    ]  // Correct - exactly 4 options
    ✓ correctAnswer: "Age under 12 or over 65"  // Correct - matches exactly one option
  
    The response must be pure JSON only.`;
}
