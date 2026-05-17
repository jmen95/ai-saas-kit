import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Sse,
  UseGuards,
} from "@nestjs/common";
import type { Organization } from "@repo/db";
import { Observable } from "rxjs";
import { CurrentOrg } from "../../../shared/decorators/current-org.decorator";
import { JwtAuthGuard } from "../../../shared/guards/jwt-auth.guard";
import { TenantGuard } from "../../../shared/guards/tenant.guard";
import { CreateConversationDto } from "../application/dtos/create-conversation.dto";
import { UpdateConversationDto } from "../application/dtos/update-conversation.dto";
import { CreateConversationUseCase } from "../application/use-cases/create-conversation.use-case";
import { GetConversationUseCase } from "../application/use-cases/get-conversation.use-case";
import { ListConversationsUseCase } from "../application/use-cases/list-conversations.use-case";
import { SendMessageUseCase } from "../application/use-cases/send-message.use-case";
import { Inject } from "@nestjs/common";
import {
  CONVERSATION_REPOSITORY,
  type IConversationRepository,
} from "../domain/repositories/conversation.repository.interface";
import { NotFoundException } from "@nestjs/common";
import { DomainErrorCode } from "@repo/shared";

@Controller("ai/conversations")
@UseGuards(JwtAuthGuard, TenantGuard)
export class AiController {
  constructor(
    private readonly createConversation: CreateConversationUseCase,
    private readonly listConversations: ListConversationsUseCase,
    private readonly getConversation: GetConversationUseCase,
    private readonly sendMessage: SendMessageUseCase,
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepo: IConversationRepository,
  ) {}

  @Post()
  create(@CurrentOrg() org: Organization, @Body() dto: CreateConversationDto) {
    return this.createConversation.execute(org, dto);
  }

  @Get()
  list(@CurrentOrg() org: Organization) {
    return this.listConversations.execute(org.id);
  }

  @Get(":id")
  get(@CurrentOrg() org: Organization, @Param("id") id: string) {
    return this.getConversation.execute(id, org.id);
  }

  @Patch(":id")
  async update(
    @CurrentOrg() org: Organization,
    @Param("id") id: string,
    @Body() dto: UpdateConversationDto,
  ) {
    const conversation = await this.conversationRepo.findById(id, org.id);
    if (!conversation) {
      const err = new NotFoundException("Conversation not found");
      (err as NotFoundException & { code: string }).code =
        DomainErrorCode.CONVERSATION_NOT_FOUND;
      throw err;
    }
    if (dto.title !== undefined) conversation.setTitle(dto.title);
    if (dto.systemPrompt !== undefined) {
      conversation.setSystemPrompt(dto.systemPrompt);
    }
    await this.conversationRepo.save(conversation);
    return { id: conversation.id, title: conversation.title };
  }

  @Delete(":id")
  async remove(@CurrentOrg() org: Organization, @Param("id") id: string) {
    await this.conversationRepo.delete(id, org.id);
    return { success: true };
  }

  @Sse(":id/stream")
  stream(
    @CurrentOrg() org: Organization,
    @Param("id") id: string,
    @Query("message") message: string,
  ): Observable<MessageEvent> {
    return this.sendMessage.execute(id, org.id, message ?? "", org);
  }
}
