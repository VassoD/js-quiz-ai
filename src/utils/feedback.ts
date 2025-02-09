export function getFeedbackMessage(isCorrect: boolean, difficulty: string) {
  if (isCorrect) {
    switch (difficulty) {
      case "easy":
        return "Good job! You're getting the basics down. Keep going!";
      case "medium":
        return "Excellent work! You're mastering intermediate concepts!";
      case "hard":
        return "Outstanding! You're handling advanced JavaScript like a pro!";
      default:
        return "Well done! Keep up the great work!";
    }
  }
  return "Don't worry! JavaScript concepts take time to master. Let's understand why:";
}

export function getProgressFeedback(correctAnswersInRow: number) {
  if (correctAnswersInRow === 1) return "Great start! Keep the momentum going!";
  if (correctAnswersInRow === 2)
    return "You're on a roll! Ready for some harder questions?";
  if (correctAnswersInRow === 3)
    return "Impressive streak! You're almost at advanced level!";
  if (correctAnswersInRow >= 4)
    return "Amazing! You're mastering these concepts!";
  return "";
}
