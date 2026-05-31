"use client";

import { useMemo, useState } from "react";
import { Bot, Loader2, MessageSquare, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import type { AssistantPage, ChatMessage, ChatResponse } from "@/lib/ai/types";

const pageMap: Record<string, AssistantPage> = {
  "/": "overview",
  "/attribution": "attribution",
  "/regression": "regression",
  "/comparison": "comparison",
  "/simulation": "simulation",
  "/methodology": "methodology"
};

export function AssistantDock({ suggestedQuestions }: { suggestedQuestions: string[] }) {
  const pathname = usePathname();
  const page = pageMap[pathname] ?? "overview";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Ask me about attribution, regression, model comparison, or simulation results."
    }
  ]);
  const prompts = useMemo(() => suggestedQuestions.slice(0, 4), [suggestedQuestions]);

  async function ask(message: string) {
    const trimmed = message.trim();
    if (!trimmed || loading) {
      return;
    }
    setInput("");
    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          page,
          conversation: nextMessages.slice(-6)
        })
      });
      const payload = (await response.json()) as ChatResponse | { error: string };
      if ("error" in payload) {
        throw new Error(payload.error);
      }
      setMessages((current) => [...current, { role: "assistant", content: payload.answer }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "I could not answer that request right now. The dashboard data is still available in the page charts and tables."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Signal Assistant"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-white shadow-soft transition hover:bg-brand sm:h-auto sm:w-auto sm:px-4 sm:py-3"
      >
        <MessageSquare size={18} />
        <span className="hidden sm:inline">Signal Assistant</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm">
          <aside className="ml-auto flex h-full w-full max-w-[440px] flex-col bg-white shadow-soft">
            <header className="flex items-center justify-between border-b border-line px-4 py-4">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-brand p-2 text-white">
                  <Bot size={20} />
                </span>
                <div>
                  <p className="font-semibold text-ink">Signal Assistant</p>
                  <p className="text-xs text-muted">Grounded in dashboard outputs</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-muted hover:bg-surface">
                <X size={18} />
              </button>
            </header>

            <div className="thin-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-lg px-3 py-2 text-sm leading-6 ${
                    message.role === "assistant" ? "bg-surface text-ink" : "ml-8 bg-ink text-white"
                  }`}
                >
                  {message.content}
                </div>
              ))}
              {loading ? (
                <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-muted">
                  <Loader2 size={16} className="animate-spin" />
                  Reading project context...
                </div>
              ) : null}
            </div>

            <div className="border-t border-line p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => ask(prompt)}
                    className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:border-brand hover:text-brand"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  ask(input);
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about this dashboard..."
                  className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-signal"
                />
                <button type="submit" className="rounded-lg bg-brand px-3 text-white hover:bg-ink" disabled={loading}>
                  <Send size={17} />
                </button>
              </form>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
