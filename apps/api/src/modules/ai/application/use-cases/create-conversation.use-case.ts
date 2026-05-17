import { ForbiddenException, Injectable } from "@nestjs/common";
import type { Organization } from "@repo/db";
import { DomainErrorCode, getPlanLimits } from "@repo/shared";
import { createId } from "@paralleldrive/cuid2";
import { Conversation } from "../../domain/entities/conversation.entity";
import {
  CONVERSATION_REPOSITORY,
  type IConversationRepository,
} from "../../domain/repositories/conversation.repository.interface";
import { Inject } from "@nestjs/common";
import type { CreateConversationDto } from "../dtos/create-conversation.dto";

@Injectable()
export class CreateConversationUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly repo: IConversationRepository,
  ) {}

  async execute(org: Organization, dto: CreateConversationDto) {
    const limits = getPlanLimits(org.plan);
    const count = await this.repo.countByOrganization(org.id);
    if (count >= limits.conversationsTotal) {
      const err = new ForbiddenException("Conversation limit reached");
      (err as ForbiddenException & { code: string }).code =
        DomainErrorCode.PLAN_LIMIT_REACHED;
      throw err;
    }

    if (dto.systemPrompt && !limits.systemPromptEnabled) {
      const err = new ForbiddenException("System prompt requires Pro plan");
      (err as ForbiddenException & { code: string }).code =
        DomainErrorCode.PLAN_LIMIT_REACHED;
      throw err;
    }

    const conversation = Conversation.create({
      id: createId(),
      organizationId: org.id,
      title: dto.title,
      systemPrompt: dto.systemPrompt,
    });

    await this.repo.save(conversation);
    return {
      id: conversation.id,
      title: conversation.title,
      systemPrompt: conversation.systemPrompt,
      createdAt: conversation.createdAt,
    };
  }
}
