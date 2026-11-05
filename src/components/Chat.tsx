"use client";

import { useEffect, useRef, useState } from "react";
import type { profile as Profile } from "@/lib/cv";

type Lang = "ar" | "en";
type Message = { role: "user" | "assistant"; content: string };

const text = {
  ar: {
    intro: "اسألني أي شي عن خبراته ومشاريعه ومهاراته، وأجاوبك من بياناته مباشرة.",
    placeholder: "اكتب سؤالك هنا...",
    send: "إرسال",
    thinking: "يكتب...",
    switchLang: "English",
    suggestions: ["وش أبرز مشاريعه؟", "وش المهارات التقنية اللي يتقنها؟", "وش البرامج اللي يستخدمها؟", "عنده شهادات؟"],
    errors: {
      rate_limited: "وصلت للحد اليومي من الأسئلة. جرّب بكرة أو تواصل معه مباشرة.",
      not_configured: "المساعد غير مفعّل حاليًا.",
      generic: "صار خطأ، حاول مرة ثانية.",
    },
  },
  en: {
    intro: "Ask me anything about their experience, projects and skills. I answer straight from their data.",
    placeholder: "Type your question...",
    send: "Send",
    thinking: "Typing...",
    switchLang: "العربية",
    suggestions: ["What are the top projects?", "Which technical skills?", "Which tools are used?", "Any certificates?"],
    errors: {
      rate_limited: "You reached today's question limit. Try again tomorrow or get in touch directly.",
      not_configured: "The assistant is not configured yet.",
      generic: "Something went wrong, please try again.",
    },
  },
} as const;

export default function Chat({ profile }: { profile: typeof Profile }) {
  const [lang, setLang] = useState<Lang>("ar");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const t = text[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    const history: Message[] = [...messages, { role: "user", content: q }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) {
        const { error: code } = await res.json().catch(() => ({ error: "generic" }));
        throw new Error(code);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: answer }]);
      }
      if (!answer) throw new Error("generic");
    } catch (e) {
      const code = (e as Error).message as keyof typeof t.errors;
      setError(t.errors[code] ?? t.errors.generic);
      setMessages(history.slice(0, -1));
      setInput(q);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{profile.name[lang]}</h1>
          <p className="mt-1 text-muted">{profile.title[lang]}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {profile.links.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          className="shrink-0 rounded-full border border-border px-3 py-1 text-sm hover:bg-surface"
        >
          {t.switchLang}
        </button>
      </header>

      <section className="flex flex-1 flex-col rounded-2xl border border-border bg-surface">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <p className="text-muted">{t.intro}</p>
              <div className="flex flex-wrap gap-2">
                {t.suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-start" : "flex justify-end"}>
                <div
                  dir="auto"
                  className={
                    m.role === "user"
                      ? "max-w-[85%] whitespace-pre-wrap rounded-2xl bg-accent px-4 py-2 text-accent-foreground"
                      : "max-w-[85%] whitespace-pre-wrap rounded-2xl border border-border px-4 py-2"
                  }
                >
                  {m.content || <span className="text-muted">{t.thinking}</span>}
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>

        {error && <p className="px-4 pb-2 text-sm text-red-600 sm:px-6">{error}</p>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex gap-2 border-t border-border p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            maxLength={1000}
            dir="auto"
            className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2 outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-xl bg-accent px-5 py-2 font-medium text-accent-foreground disabled:opacity-50"
          >
            {t.send}
          </button>
        </form>
      </section>
    </div>
  );
}
