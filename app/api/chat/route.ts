import { NextResponse } from "next/server";
import { z } from "zod";

import { buildMentorMessages } from "@/lib/prompt";

const requestSchema = z.object({
  message: z.string().trim().min(1),
  idea: z.string().trim().min(1),
  stage: z.string().trim().min(1),
  goal: z.string().trim().min(1),
});

type ChatPayload = z.infer<typeof requestSchema>;

type GroqErrorResponse = {
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
};

type GroqCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function buildMockReply({ message, idea, stage, goal }: ChatPayload) {
  return [
    "1. Idea Summary",
    `You are building ${idea} at the ${stage} stage and asking: ${message}`,
    "",
    "2. Market Reality",
    "If this sounds useful to everyone, it probably matters deeply to no one. Narrow the buyer and the pain point.",
    "",
    "3. Biggest Mistake",
    `You may be treating \"${goal}\" as a product task when it is really a validation task that needs real user evidence.`,
    "",
    "4. Brutal Truth",
    "A startup does not fail because the idea sounds bad in a chat. It fails when nobody urgently wants it enough to change behavior or pay.",
    "",
    "5. Action Steps",
    "Interview 5 target users this week and ask how they solve this today.",
    "Define the single buyer persona most likely to care first.",
    "Write one concrete value proposition without buzzwords.",
    "Test a landing page or outreach pitch before building more.",
    "This is a mock response because mock mode is enabled.",
  ].join("\n");
}

function parseProviderError(errorText: string) {
  try {
    const parsed = JSON.parse(errorText) as GroqErrorResponse;

    return {
      message: parsed.error?.message || "Provider request failed.",
      type: parsed.error?.type,
      code: parsed.error?.code,
    };
  } catch {
    return {
      message: errorText || "Provider request failed.",
      type: undefined,
      code: undefined,
    };
  }
}

function buildFriendlyError(errorText: string) {
  const providerError = parseProviderError(errorText);

  if (
    providerError.type === "insufficient_quota" ||
    providerError.code === "insufficient_quota"
  ) {
    return {
      error:
        "Your Groq project has no available quota right now. Add credits or enable mock mode in .env.local to keep building locally.",
      code: "insufficient_quota",
    };
  }

  return {
    error: providerError.message,
    code: providerError.code || "provider_error",
  };
}

function shouldUseMockMode() {
  return process.env.GROQ_USE_MOCK === "true";
}

function getGroqConfig() {
  return {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  };
}

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const { apiKey, model } = getGroqConfig();

    if (shouldUseMockMode()) {
      return NextResponse.json({
        reply: buildMockReply(payload),
        mode: "mock",
      });
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GROQ_API_KEY is missing. Add GROQ_API_KEY to .env.local.",
          code: "missing_api_key",
        },
        { status: 500 },
      );
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: buildMentorMessages(payload),
        temperature: 0.8,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      return NextResponse.json(buildFriendlyError(errorText), {
        status: groqResponse.status,
      });
    }

    const data = (await groqResponse.json()) as GroqCompletionResponse;
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json(
        {
          error: "The model returned an empty response.",
          code: "empty_response",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply, mode: "live" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request payload.", details: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Something went wrong while generating mentor feedback." },
      { status: 500 },
    );
  }
}
