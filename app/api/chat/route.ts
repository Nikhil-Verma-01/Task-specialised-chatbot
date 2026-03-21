import { NextResponse } from "next/server";
import { z } from "zod";

import { buildMentorMessages } from "@/lib/prompt";

const requestSchema = z.object({
  context: z.object({
    idea: z.string().min(1),
    stage: z.string().min(1),
    goal: z.string().min(1),
  }),
  messages: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .min(1),
});

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing." },
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
        input: buildMentorMessages(payload.context, payload.messages),
        temperature: 0.8,
      }),
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      return NextResponse.json(
        { error: errorText || "OpenAI request failed." },
        { status: openAiResponse.status },
      );
    }

    const data = await openAiResponse.json();
    const text =
      data.output_text ||
      data.output
        ?.flatMap((item: { content?: Array<{ text?: string }> }) =>
          (item.content || []).map((content) => content.text || ""),
        )
        .join("") ||
      "";

    return NextResponse.json({ message: text.trim() });
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
