import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DomainErrorCode } from "@repo/shared";
import {
  CONVERSATION_REPOSITORY,
  type IConversationRepository,
} from "../../domain/repositories/conversation.repository.interface";

@Injectable()
export class GetConversationUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly repo: IConversationRepository,
  ) {}

  async execute(id: string, organizationId: string) {
    const conversation = await this.repo.findById(id, organizationId);
    if (!conversation) {
      const err = new NotFoundException("Conversation not found");
      (err as NotFoundException & { code: string }).code =
        DomainErrorCode.CONVERSATION_NOT_FOUND;
      throw err;
    }

    return {
      id: conversation.id,
      title: conversation.title,
      systemPrompt: conversation.systemPrompt,
      createdAt: conversation.createdAt,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        tokensUsed: m.tokensUsed,
        createdAt: m.createdAt,
      })),
    };
  }
}
