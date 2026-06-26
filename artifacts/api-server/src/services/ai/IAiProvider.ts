export interface ChatMessage {
  role:    "user" | "assistant" | "system";
  content: string;
}

export interface AiOptions {
  model?:       string;
  temperature?: number;
  maxTokens?:   number;
  stream?:      boolean;
}

export interface AiResponse {
  content:          string;
  model:            string;
  provider:         string;
  promptTokens:     number;
  completionTokens: number;
  totalTokens:      number;
  latencyMs:        number;
}

export interface IAiProvider {
  readonly name:    string;
  readonly model:   string;
  chat(messages: ChatMessage[], systemPrompt?: string, options?: AiOptions): Promise<AiResponse>;
}
