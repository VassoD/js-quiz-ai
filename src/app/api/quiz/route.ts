import { NextResponse } from "next/server";
import { QuestionRequest } from "@/types/quiz";
import { isValidDifficulty, isValidTopic } from "@/utils/validators";
import { validateQuestionData } from "@/utils/validateQuestionData";
import { generatePrompt } from "./prompt";

interface MistralMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  console.log("🚀 POST /api/quiz - Starting request processing");
  try {
    const clonedRequest = request.clone();
    const rawData = await clonedRequest.json();
    console.log("📦 Request body:", rawData);

    if (
      !rawData ||
      typeof rawData !== "object" ||
      !("topic" in rawData) ||
      !("difficulty" in rawData) ||
      !isValidTopic(rawData.topic) ||
      !isValidDifficulty(rawData.difficulty)
    ) {
      throw new Error("Invalid request data");
    }

    const requestData: QuestionRequest = {
      topic: rawData.topic,
      difficulty: rawData.difficulty,
      excludePatterns:
        "excludePatterns" in rawData
          ? String(rawData.excludePatterns)
          : undefined,
    };

    if (!process.env.MISTRAL_API_KEY) {
      throw new Error("API key not configured");
    }

    const messages: MistralMessage[] = [
      {
        role: "system",
        content: `You are an expert JavaScript educator creating high-quality quiz questions. 
        Focus on modern JavaScript best practices and practical applications. 
        Ensure questions are unique and follow the specified format exactly.`,
      },
      {
        role: "user",
        content: generatePrompt(
          requestData.topic,
          requestData.difficulty,
          requestData.excludePatterns
        ),
      },
    ];

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-tiny",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (response.status === 429) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again in a few seconds.",
          retryAfter: response.headers.get("retry-after") || "5",
        },
        {
          status: 429,
          headers: {
            "Retry-After": response.headers.get("retry-after") || "5",
          },
        }
      );
    }

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const responseData = await response.json();
    if (!responseData?.choices?.[0]?.message?.content) {
      throw new Error("Invalid API response format");
    }

    const content = responseData.choices[0].message.content;
    const cleanedContent = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      const parsedData = JSON.parse(cleanedContent);
      const validatedQuestion = validateQuestionData(
        parsedData,
        requestData.excludePatterns
      );
      console.log("✅ Validated question data:", validatedQuestion);
      console.log("✨ Successfully processed quiz submission");
      return NextResponse.json(validatedQuestion);
    } catch (parseError) {
      return NextResponse.json(
        {
          error:
            parseError instanceof Error
              ? parseError.message
              : "Failed to parse question data",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❌ Error in POST /api/quiz:", error);
    return NextResponse.json(
      {
        error: "Failed to generate question. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
