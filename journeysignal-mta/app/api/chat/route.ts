import { z } from "zod";
import { buildAssistantContext, localFallbackAnswer } from "@/lib/ai/build-context";
import { assistantSystemPrompt } from "@/lib/ai/prompt";
import type { ChatRequest, ChatResponse } from "@/lib/ai/types";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const chatSchema = z.object({
  message: z.string().min(1).max(1200),
  page: z.enum(["overview", "attribution", "regression", "comparison", "simulation", "methodology"]),
  chartId: z.string().max(80).optional(),
  filters: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).optional(),
  conversation: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(1600)
      })
    )
    .max(8)
    .optional()
});

function getClientId(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(clientId: string) {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }

  const current = rateLimitStore.get(clientId);
  if (!current || current.resetAt <= now) {
    rateLimitStore.set(clientId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  current.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - current.count };
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(getClientId(request));
  if (!rateLimit.allowed) {
    return Response.json({ error: "Too many chat requests. Please wait and try again." }, { status: 429 });
  }

  let parsed: ChatRequest;

  try {
    const body = await request.json();
    parsed = chatSchema.parse(body);
  } catch {
    return Response.json({ error: "Invalid chat request." }, { status: 400 });
  }

  const context = buildAssistantContext(parsed);

  if (!process.env.OPENAI_API_KEY) {
    const response: ChatResponse = {
      answer: localFallbackAnswer(parsed.message, parsed),
      usedContext: context.usedContext,
      caveats: context.caveats.slice(0, 2)
    };
    return Response.json(response);
  }

  try {
    const conversation = parsed.conversation
      ?.slice(-6)
      .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
      .join("\n");
    const prompt = [
      context.contextText,
      conversation ? `Recent conversation:\n${conversation}` : undefined,
      `User question:\n${parsed.message}`
    ]
      .filter(Boolean)
      .join("\n\n");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 16000);
    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "gpt-4o-mini",
        instructions: assistantSystemPrompt,
        input: prompt,
        max_output_tokens: 450
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!openaiResponse.ok) {
      throw new Error("OpenAI request failed");
    }

    const result = (await openaiResponse.json()) as {
      output_text?: string;
      output?: Array<{ content?: Array<{ text?: string; type?: string }> }>;
    };
    const answer =
      result.output_text ??
      result.output
        ?.flatMap((item) => item.content ?? [])
        .map((item) => item.text)
        .filter(Boolean)
        .join("\n") ??
      "";

    if (!answer.trim()) {
      throw new Error("OpenAI response did not contain text");
    }

    const chatResponse: ChatResponse = {
      answer,
      usedContext: context.usedContext,
      caveats: context.caveats.slice(0, 2)
    };
    return Response.json(chatResponse);
  } catch {
    const response: ChatResponse = {
      answer: localFallbackAnswer(parsed.message, parsed),
      usedContext: context.usedContext,
      caveats: ["The live AI call failed, so this response used the local project context fallback."]
    };
    return Response.json(response);
  }
}
