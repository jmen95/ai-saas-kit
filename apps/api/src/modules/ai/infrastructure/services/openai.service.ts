import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { Observable } from "rxjs";
import type { Message } from "../../domain/entities/message.entity";
import { MessageRole } from "../../domain/value-objects/message-role.vo";

export type StreamChunk = { delta: string } | { done: true; tokensUsed: number };

@Injectable()
export class OpenAIService {
  private readonly client: OpenAI | null;

  constructor(config: ConfigService) {
    const key = config.get<string>("OPENAI_API_KEY");
    this.client = key?.startsWith("sk-") ? new OpenAI({ apiKey: key }) : null;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  streamCompletion(input: {
    messages: readonly Message[];
    systemPrompt: string | null;
    model?: string;
  }): Observable<StreamChunk> {
    return new Observable((subscriber) => {
      void this.runStream(input, subscriber);
    });
  }

  private async runStream(
    input: {
      messages: readonly Message[];
      systemPrompt: string | null;
      model?: string;
    },
    subscriber: {
      next: (v: StreamChunk) => void;
      complete: () => void;
      error: (e: unknown) => void;
    },
  ) {
    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (input.systemPrompt) {
      chatMessages.push({ role: "system", content: input.systemPrompt });
    }

    for (const m of input.messages) {
      chatMessages.push({
        role:
          m.role === MessageRole.ASSISTANT
            ? "assistant"
            : m.role === MessageRole.SYSTEM
              ? "system"
              : "user",
        content: m.content,
      });
    }

    const model = input.model ?? "gpt-4o-mini";

    if (!this.client) {
      const mock = "AI is not configured. Set OPENAI_API_KEY to enable responses.";
      for (const word of mock.split(" ")) {
        subscriber.next({ delta: word + " " });
        await sleep(40);
      }
      subscriber.next({ done: true, tokensUsed: 0 });
      subscriber.complete();
      return;
    }

    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages: chatMessages,
        stream: true,
      });

      let full = "";
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? "";
        if (delta) {
          full += delta;
          subscriber.next({ delta });
        }
      }

      const tokensUsed = Math.ceil(full.length / 4);
      subscriber.next({ done: true, tokensUsed });
      subscriber.complete();
    } catch (err) {
      subscriber.error(err);
    }
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
