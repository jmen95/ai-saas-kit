import { Module } from "@nestjs/common";
import { CreateConversationUseCase } from "./application/use-cases/create-conversation.use-case";
import { GetConversationUseCase } from "./application/use-cases/get-conversation.use-case";
import { ListConversationsUseCase } from "./application/use-cases/list-conversations.use-case";
import { SendMessageUseCase } from "./application/use-cases/send-message.use-case";
import { CONVERSATION_REPOSITORY } from "./domain/repositories/conversation.repository.interface";
import { PrismaConversationRepository } from "./infrastructure/repositories/prisma-conversation.repository";
import { OpenAIService } from "./infrastructure/services/openai.service";
import { AiController } from "./presentation/ai.controller";

@Module({
  controllers: [AiController],
  providers: [
    { provide: CONVERSATION_REPOSITORY, useClass: PrismaConversationRepository },
    OpenAIService,
    CreateConversationUseCase,
    ListConversationsUseCase,
    GetConversationUseCase,
    SendMessageUseCase,
  ],
})
export class AiModule {}
