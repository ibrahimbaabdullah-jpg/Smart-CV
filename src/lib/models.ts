import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

// Tried in order: free Gemini first, free Groq when Gemini fails or hits its quota.
export function models(): { name: string; model: LanguageModel }[] {
  const list: { name: string; model: LanguageModel }[] = [];
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const id = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
    list.push({ name: `google/${id}`, model: google(id) });
  }
  if (process.env.GROQ_API_KEY) {
    const id = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";
    list.push({ name: `groq/${id}`, model: groq(id) });
  }
  return list;
}
