import type { IAiProvider, ChatMessage, AiOptions, AiResponse } from "./IAiProvider.js";
import { logger } from "../../lib/logger.js";

export class OpenAIProvider implements IAiProvider {
  readonly name:  string;
  readonly model: string;
  private readonly apiKey: string;

  constructor(apiKey: string, model = "gpt-4o-mini") {
    this.apiKey = apiKey;
    this.model  = model;
    this.name   = "openai";
  }

  async chat(messages: ChatMessage[], systemPrompt?: string, options?: AiOptions): Promise<AiResponse> {
    const start = Date.now();
    const model = options?.model ?? this.model;

    const allMessages: { role: string; content: string }[] = [];
    if (systemPrompt) allMessages.push({ role: "system", content: systemPrompt });
    allMessages.push(...messages);

    const body = {
      model,
      messages:    allMessages,
      temperature: options?.temperature ?? 0.7,
      max_tokens:  options?.maxTokens ?? 1024,
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      logger.error({ err }, "[OpenAI] API error");
      throw new Error(`OpenAI error: ${res.status} ${err}`);
    }

    const json = await res.json() as {
      choices: Array<{ message: { content: string } }>;
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
      model: string;
    };

    const content          = json.choices[0]?.message?.content ?? "";
    const usage            = json.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    return {
      content,
      model:            json.model ?? model,
      provider:         this.name,
      promptTokens:     usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens:      usage.total_tokens,
      latencyMs:        Date.now() - start,
    };
  }
}
