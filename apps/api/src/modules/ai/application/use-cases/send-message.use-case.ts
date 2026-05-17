import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createId } from "@paralleldrive/cuid2";
import type { Organization } from "@repo/db";
import { DomainErrorCode, getPlanLimits } from "@repo/shared";
import { Observable } from "rxjs";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { MessageRole } from "../../domain/value-objects/message-role.vo";
import {
  CONVERSATION_REPOSITORY,
  type IConversationRepository,
} from "../../domain/repositories/conversation.repository.interface";
import {
  OpenAIService,
  type StreamChunk,
} from "../../infrastructure/services/openai.service";

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepo: IConversationRepository,
    private readonly openai: OpenAIService,
    private readonly prisma: PrismaService,
  ) {}

  execute(
    conversationId: string,
    organizationId: string,
    userMessage: string,
    org: Organization,
  ): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      void this.run(
        conversationId,
        organizationId,
        userMessage,
        org,
        subscriber,
      );
    });
  }

  private async run(
    conversationId: string,
    organizationId: string,
    userMessage: string,
    org: Organization,
    subscriber: {
      next: (v: MessageEvent) => void;
      complete: () => void;
      error: (e: unknown) => void;
    },
  ) {
    try {
      const conversation = await this.conversationRepo.findById(
        conversationId,
        organizationId,
      );
      if (!conversation) {
        const err = new NotFoundException("Conversation not found");
        (err as NotFoundException & { code: string }).code =
          DomainErrorCode.CONVERSATION_NOT_FOUND;
        throw err;
      }

      const limits = getPlanLimits(org.plan);
      if (!conversation.canAddMessage(limits, org.messagesUsedThisMonth)) {
        const err = new ForbiddenException("Monthly message limit reached");
        (err as ForbiddenException & { code: string }).code =
          DomainErrorCode.PLAN_LIMIT_REACHED;
        throw err;
      }

      conversation.addMessage(MessageRole.USER, userMessage, createId());
      await this.conversationRepo.save(conversation);

      const model = limits.modelAccess[0] ?? "gpt-4o-mini";
      let fullContent = "";

      this.openai
        .streamCompletion({
          messages: conversation.getContextWindow(),
          systemPrompt: conversation.systemPrompt,
          model,
        })
        .subscribe({
          next: (chunk: StreamChunk) => {
            if ("delta" in chunk) {
              fullContent += chunk.delta;
              subscriber.next({
                data: JSON.stringify({ delta: chunk.delta }),
              } as MessageEvent);
            }
          },
          error: (err) => subscriber.error(err),
          complete: () => {
            void this.persistAssistant(
              conversationId,
              organizationId,
              fullContent,
              subscriber,
            );
          },
        });
    } catch (err) {
      subscriber.error(err);
    }
  }

  private async persistAssistant(
    conversationId: string,
    organizationId: string,
    fullContent: string,
    subscriber: {
      next: (v: MessageEvent) => void;
      complete: () => void;
    },
  ) {
    const conversation = await this.conversationRepo.findById(
      conversationId,
      organizationId,
    );
    if (conversation) {
      conversation.addMessage(
        MessageRole.ASSISTANT,
        fullContent,
        createId(),
      );
      await this.conversationRepo.save(conversation);
    }

    await this.prisma.client.organization.update({
      where: { id: organizationId },
      data: { messagesUsedThisMonth: { increment: 1 } },
    });

    subscriber.next({
      data: JSON.stringify({ done: true }),
    } as MessageEvent);
    subscriber.complete();
  }
}
