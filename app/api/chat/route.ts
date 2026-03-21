import { NextResponse } from "next/server";
import { z } from "zod";

import { buildMentorMessages } from "@/lib/prompt";

const requestSchema = z.object({
  message: z.string().trim().min(1),
  idea: z.string().trim().min(1),
  stage: z.string().trim().min(1),
  goal: z.string().trim().min(1),
});

const legacyRequestSchema = z.object({
  context: z.object({
    idea: z.string().trim().min(1),
    stage: z.string().trim().min(1),
    goal: z.string().trim().min(1),
  }),
  messages: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1),
      }),
    )
    .min(1),
});

type ChatPayload = {
  message: string;
  idea: string;
  stage: string;
  goal: string;
};

function normalizeRequestBody(payload: unknown): ChatPayload {
  const nextPayload = requestSchema.safeParse(payload);

  if (nextPayload.success) {
    return nextPayload.data;
  }

  const legacyPayload = legacyRequestSchema.safeParse(payload);

  if (legacyPayload.success) {
    const latestUserMessage = [...legacyPayload.data.messages]
      .reverse()
      .find((message) => message.role === "user");

    if (!latestUserMessage) {
      throw new z.ZodError([
        {
          code: "custom",
          message: "At least one user message is required.",
          path: ["message"],
        },
      ]);
    }

    return {
      message: latestUserMessage.content,
      idea: legacyPayload.data.context.idea,
      stage: legacyPayload.data.context.stage,
      goal: legacyPayload.data.context.goal,
    };
  }

  throw new z.ZodError(nextPayload.error.issues);
}

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
    "5. Actionable Next Steps",
    "Interview 5 target users this week and ask how they solve this today.",
    "Define the single buyer persona most likely to care first.",
    "Write one concrete value proposition without buzzwords.",
    "Test a landing page or outreach pitch before building more.",
    "This is a mock response because OpenAI mock mode is enabled.",
  ].join("\n");
}

function parseProviderError(errorText: string) {
  try {
    const parsed = JSON.parse(errorText) as {
      error?: { message?: string; type?: string; code?: string };
    };

    return {
      message: parsed.error?.message || "OpenAI request failed.",
      type: parsed.error?.type,
      code: parsed.error?.code,
    };
  } catch {
    return {
      message: errorText || "OpenAI request failed.",
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
        "Your OpenAI project has no available quota right now. Add billing or credits, or enable OPENAI_USE_MOCK=true in .env.local to keep building locally.",
      code: "insufficient_quota",
    };
  }

  return {
    error: providerError.message,
    code: providerError.code || "provider_error",
  };
}

function shouldUseMockMode() {
  return process.env.OPENAI_USE_MOCK === "true";
}

export async function POST(request: Request) {
  try {
    const payload = normalizeRequestBody(await request.json());
    const apiKey = process.env.OPENAI_API_KEY;

    if (shouldUseMockMode()) {
      return NextResponse.json({
        reply: buildMockReply(payload),
        mode: "mock",
      });
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY is missing. Add it to .env.local or enable OPENAI_USE_MOCK=true for local development.",
          code: "missing_api_key",
        },
        { status: 500 },
      );
    }

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: buildMentorMessages(payload),
        temperature: 0.8,
      }),
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      return NextResponse.json(buildFriendlyError(errorText), {
        status: openAiResponse.status,
      });
    }

    const data = await openAiResponse.json();
    const reply =
      data.output_text ||
      data.output
        ?.flatMap((item: { content?: Array<{ text?: string }> }) =>
          (item.content || []).map((content) => content.text || ""),
        )
        .join("") ||
      "";

    return NextResponse.json({ reply: reply.trim(), mode: "live" });
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
