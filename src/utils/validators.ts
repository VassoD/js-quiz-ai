const validTopics = new Set([
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
]);

const validDifficulties = new Set(["easy", "medium", "hard"]);

export function isValidTopic(value: unknown): boolean {
  return typeof value === "string" && validTopics.has(value);
}

export function isValidDifficulty(value: unknown): boolean {
  return typeof value === "string" && validDifficulties.has(value);
}
