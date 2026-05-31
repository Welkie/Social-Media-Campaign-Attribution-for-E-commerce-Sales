export type AssistantPage =
  | "overview"
  | "attribution"
  | "regression"
  | "comparison"
  | "simulation"
  | "methodology";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  message: string;
  page: AssistantPage;
  chartId?: string;
  filters?: Record<string, string | number | boolean | string[]>;
  conversation?: ChatMessage[];
};

export type ChatResponse = {
  answer: string;
  usedContext: string[];
  caveats: string[];
};
