import { NextResponse } from "next/server";
import { validateQuestionData } from "@/utils/validateQuestionData";
import { Difficulty, Question, Topic } from "@/types/quiz";

interface CodeReviewComment {
  comment: string;
  file?: string;
  context: string;
  index: number;
}

interface ParsedQuestion {
  question: string;
  code: string | null;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: Topic;
  difficulty: Difficulty;
  sourceComments: number[];
}

export async function POST(request: Request) {
  try {
    const { reviewData, difficulty } = await request.json();

    // Parse the review comments into structured data with more context
    const comments: CodeReviewComment[] = reviewData
      .split("------------------------------")
      .map((block: string, index: number) => {
        const lines = block.split("\n");
        const commentLine = lines.find((line) =>
          line.trim().startsWith("Comment:")
        );
        const fileLine = lines.find((line) => line.trim().startsWith("File:"));

        if (!commentLine) return null;

        return {
          comment: commentLine.replace("Comment:", "").trim(),
          file: fileLine?.replace("File:", "").trim(),
          context: lines.join("\n").trim(),
          index,
        };
      })
      .filter(
        (comment: CodeReviewComment | null): comment is CodeReviewComment =>
          comment !== null
      );

    const prompt = `Analyze these code review comments to understand the developer's level and common patterns:

${comments
  .map(
    (c) => `Comment ${c.index}: ${c.comment}
Context: ${c.file ? `File: ${c.file}\n` : ""}${c.context}`
  )
  .join("\n\n")}

Based on these reviews, generate 5-10 quiz questions that:
1. Match ${difficulty.toUpperCase()} difficulty level
2. Address similar concepts and patterns where they show room for improvement
3. Help reinforce good practices in areas where they commonly make mistakes

Return your response as an array of questions in the following JSON format:

{
  "questions": [
    {
      "question": "What is the recommended approach for [concept]?",
      "code": "// Simple code example if needed, or null",
      "options": [
        "Simple option 1",
        "Simple option 2",
        "Simple option 3",
        "Simple option 4"
      ],
      "correctAnswer": "Simple option 2",
      "explanation": "Brief explanation of why this is the best practice...",
      "topic": "Topic here",
      "difficulty": "${difficulty}",
      "sourceComments": [relevant comment indices]
    }
  ]
}

CRITICAL REQUIREMENTS:
1. Keep questions and answers SIMPLE and CONCISE
2. Avoid complex code in answers
3. Each question must have 3-4 short, clear options
4. The correctAnswer MUST BE AN EXACT COPY of one of the options
5. Focus on ${difficulty} level concepts

Remember: Keep all answers short and simple. The correctAnswer must match one of the options exactly.`;

    if (!process.env.MISTRAL_API_KEY) {
      throw new Error("API key not configured");
    }

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-tiny",
        messages: [
          {
            role: "system",
            content:
              "You are an expert at creating programming quiz questions based on code review feedback. Generate concise, focused questions.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.5,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const responseData = await response.json();
    const content = responseData.choices[0].message.content;

    try {
      const cleanedContent = content
        // Remove any markdown code blocks
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        // Remove any trailing commas in arrays
        .replace(/,(\s*[\]}])/g, "$1")
        // Remove any comments
        .replace(/\/\/.*/g, "")
        // Clean up any extra whitespace
        .replace(/\s+/g, " ")
        .trim();

      console.log("Cleaned content:", cleanedContent);

      let parsedData: { questions: ParsedQuestion[] };
      try {
        // Try to parse the cleaned JSON
        parsedData = JSON.parse(cleanedContent) as {
          questions: ParsedQuestion[];
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // If parsing fails, try to fix common JSON issues
        const fixedContent = cleanedContent
          .replace(/}(\s*){/g, "},{")
          .replace(/](\s*)\[/g, "],[")
          .replace(/,(\s*[\]}])/g, "$1");

        console.error(
          "First parse failed, trying with fixed content:",
          fixedContent
        );
        try {
          parsedData = JSON.parse(fixedContent) as {
            questions: ParsedQuestion[];
          };
        } catch (secondError) {
          if (secondError instanceof Error) {
            console.error("Invalid JSON format. Content:", cleanedContent);
            console.error("Parse error:", secondError);
            throw new Error(`Failed to parse JSON: ${secondError.message}`);
          }
          throw secondError;
        }
      }

      if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
        throw new Error("Response must contain an array of questions");
      }

      // Validate each question and add related comments
      const validatedQuestions = parsedData.questions.map(
        (question: ParsedQuestion) => {
          const validatedQuestion: Question = {
            ...question,
            topic: question.topic,
            difficulty: question.difficulty,
          };
          return {
            ...validateQuestionData(validatedQuestion, undefined, true),
          };
        }
      );

      return NextResponse.json(validatedQuestions);
    } catch (parseError) {
      console.error("Failed to parse Mistral response:", content);
      throw new Error(
        parseError instanceof Error
          ? parseError.message
          : "Invalid response format"
      );
    }
  } catch (error) {
    console.error("Error in custom quiz generation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate custom quiz: ${errorMessage}` },
      { status: 500 }
    );
  }
}
