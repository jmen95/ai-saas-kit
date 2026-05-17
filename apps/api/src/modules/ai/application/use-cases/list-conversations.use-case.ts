import { Inject, Injectable } from "@nestjs/common";
import {
  CONVERSATION_REPOSITORY,
  type IConversationRepository,
} from "../../domain/repositories/conversation.repository.interface";

@Injectable()
export class ListConversationsUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly repo: IConversationRepository,
  ) {}

  async execute(organizationId: string) {
    const conversations = await this.repo.findByOrganization(organizationId);
    return conversations.map((c) => ({
      id: c.id,
      title: c.title,
      systemPrompt: c.systemPrompt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      preview: c.messages[c.messages.length - 1]?.content?.slice(0, 80) ?? null,
    }));
  }
}
