import { streamText, type ModelMessage } from "ai";
import { models } from "@/lib/models";
import { systemPrompt } from "@/lib/prompt";
import { checkRateLimit } from "@/lib/rate-limit";

export const maxDuration = 30;

const DAILY_LIMIT = Number(process.env.DAILY_QUESTION_LIMIT ?? 20);
const MAX_MESSAGES = 20;
const MAX_CHARS = 1000;

type ChatMessage = { role: "user" | "assistant"; content: string };

function parseMessages(body: unknown): ChatMessage[] | null {
  const messages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const clean = messages.slice(-MAX_MESSAGES).filter(
    (m): m is ChatMessage =>
      (m?.role === "user" || m?.role === "assistant") &&
      typeof m?.content === "string" &&
      m.content.trim().length > 0,
  );
  if (clean.length === 0 || clean[clean.length - 1].role !== "user") return null;
  return clean.map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
}

export async function POST(req: Request) {
  const messages = parseMessages(await req.json().catch(() => null));
  if (!messages) return Response.json({ error: "bad_request" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip, DAILY_LIMIT).ok) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const candidates = models();
  if (candidates.length === 0) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const system = systemPrompt();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      for (const { name, model } of candidates) {
        let sent = false;
        try {
          const result = streamText({
            model,
            system,
            messages: messages as ModelMessage[],
            maxOutputTokens: 800,
            temperature: 0.3,
          });
          for await (const part of result.fullStream) {
            if (part.type === "text-delta") {
              sent = true;
              controller.enqueue(encoder.encode(part.text));
            } else if (part.type === "error") {
              throw part.error;
            }
          }
          controller.close();
          return;
        } catch (error) {
          console.error(`[chat] ${name} failed`, error);
          // Once text has reached the visitor, switching models would garble the answer.
          if (sent) break;
        }
      }
      controller.error(new Error("all_models_failed"));
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
