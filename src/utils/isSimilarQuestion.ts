const SIMILARITY_THRESHOLD = 0.75;

export function isSimilarQuestion(
  newQuestion: string,
  previousQuestions: string
): boolean {
  // Debug logging
  console.log("Previous questions received:", previousQuestions);
  console.log("New question:", newQuestion);

  // If no previous questions, it can't be similar
  if (!previousQuestions || typeof previousQuestions !== "string") {
    console.log("No previous questions or invalid type, returning false");
    return false;
  }

  try {
    // Split the previous questions string into an array, handling both comma and newline separators
    const prevQuestions = previousQuestions
      .split(/[,\n]/)
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      // Take only the last 10 questions to prevent performance issues
      .slice(-10);

    // If no valid previous questions after splitting, return false
    if (prevQuestions.length === 0) {
      console.log("No valid questions after splitting, returning false");
      return false;
    }

    // Extract key concepts from the new question
    const newConcepts = extractConcepts(newQuestion);

    // Compare with each previous question
    for (const prevQuestion of prevQuestions) {
      const prevConcepts = extractConcepts(prevQuestion);

      // Calculate concept overlap
      const similarity = calculateConceptSimilarity(newConcepts, prevConcepts);

      if (similarity > SIMILARITY_THRESHOLD) {
        console.log(`Question similarity: ${similarity}`);
        console.log("New question:", newQuestion);
        console.log("Similar to:", prevQuestion);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error in isSimilarQuestion:", error);
    // If there's an error, return false to allow the question
    return false;
  }
}

function extractConcepts(question: string): string[] {
  // Normalize the question
  const normalized = question
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Remove common question starters and words
  const cleanQuestion = normalized
    .replace(
      /^(what|how|why|which|when|where|explain|describe|identify)\s+(is|are|does|do|would|will|can|should)\s+/g,
      ""
    )
    .replace(/^(the|a|an)\s+/g, "")
    .replace(/\b(code|following|given|example|output|result)\b/g, "");

  // Extract code variables and their context
  const codeVars = question.match(/'[^']+'/g) || [];
  const codeContext = codeVars.map((v) => v.replace(/'/g, ""));

  // Extract key terms
  const words = cleanQuestion.split(" ");
  const keyTerms = words.filter(
    (word) =>
      word.length > 3 && // Skip short words
      ![
        "this",
        "that",
        "these",
        "those",
        "with",
        "from",
        "into",
        "code",
        "when",
        "what",
        "where",
        "which",
        "why",
        "how",
        "does",
        "will",
        "should",
        "would",
        "could",
        "than",
        "then",
        "have",
        "has",
        "had",
      ].includes(word)
  );

  return [...new Set([...keyTerms, ...codeContext])];
}

function calculateConceptSimilarity(
  concepts1: string[],
  concepts2: string[]
): number {
  if (concepts1.length === 0 || concepts2.length === 0) return 0;

  // Only consider unique concepts
  const set1 = new Set(concepts1);
  const set2 = new Set(concepts2);

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  // Weight the similarity by the number of concepts
  const similarityScore = intersection.size / union.size;
  const conceptCountDiff =
    Math.abs(set1.size - set2.size) / Math.max(set1.size, set2.size);

  return similarityScore * (1 - conceptCountDiff);
}
