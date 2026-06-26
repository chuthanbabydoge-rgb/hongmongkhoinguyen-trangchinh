import type { IAiProvider, ChatMessage, AiOptions, AiResponse } from "./IAiProvider.js";
import { logger } from "../../lib/logger.js";

export class GeminiProvider implements IAiProvider {
  readonly name:  string;
  readonly model: string;
  private readonly apiKey: string;

  constructor(apiKey: string, model = "gemini-1.5-flash") {
    this.apiKey = apiKey;
    this.model  = model;
    this.name   = "gemini";
  }

  async chat(messages: ChatMessage[], systemPrompt?: string, options?: AiOptions): Promise<AiResponse> {
    const start = Date.now();
    const model = options?.model ?? this.model;

    const contents = messages.map(m => ({
      role:  m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature:    options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 1024,
      },
    };

    if (systemPrompt) {
      body["systemInstruction"] = { parts: [{ text: systemPrompt }] };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      logger.error({ err }, "[Gemini] API error");
      throw new Error(`Gemini error: ${res.status} ${err}`);
    }

    const json = await res.json() as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number };
    };

    const content  = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const usage    = json.usageMetadata ?? {};
    const promptTk = usage.promptTokenCount     ?? Math.ceil((messages.map(m => m.content).join("").length) / 4);
    const compTk   = usage.candidatesTokenCount ?? Math.ceil(content.length / 4);
    return {
      content,
      model:            model,
      provider:         this.name,
      promptTokens:     promptTk,
      completionTokens: compTk,
      totalTokens:      usage.totalTokenCount ?? (promptTk + compTk),
      latencyMs:        Date.now() - start,
    };
  }
}
