import { Injectable } from "@nestjs/common";
import type { Message as PrismaMessage, Conversation as PrismaConversation } from "@repo/db";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { Conversation } from "../../domain/entities/conversation.entity";
import { Message } from "../../domain/entities/message.entity";
import { MessageRole } from "../../domain/value-objects/message-role.vo";
import type { IConversationRepository } from "../../domain/repositories/conversation.repository.interface";

@Injectable()
export class PrismaConversationRepository implements IConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    organizationId: string,
  ): Promise<Conversation | null> {
    const raw = await this.prisma.client.conversation.findFirst({
      where: { id, organizationId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async findByOrganization(organizationId: string): Promise<Conversation[]> {
    const rows = await this.prisma.client.conversation.findMany({
      where: { organizationId },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async save(conversation: Conversation): Promise<void> {
    await this.prisma.client.conversation.upsert({
      where: { id: conversation.id },
      create: {
        id: conversation.id,
        organizationId: conversation.organizationId,
        title: conversation.title,
        systemPrompt: conversation.systemPrompt,
      },
      update: {
        title: conversation.title,
        systemPrompt: conversation.systemPrompt,
        updatedAt: new Date(),
      },
    });

    for (const message of conversation.messages) {
      const data = message.toPersistence();
      await this.prisma.client.message.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          conversationId: data.conversationId,
          role: data.role as "USER" | "ASSISTANT" | "SYSTEM",
          content: data.content,
          tokensUsed: data.tokensUsed,
          createdAt: data.createdAt,
        },
        update: {
          content: data.content,
          tokensUsed: data.tokensUsed,
        },
      });
    }
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.prisma.client.conversation.deleteMany({
      where: { id, organizationId },
    });
  }

  async countByOrganization(organizationId: string): Promise<number> {
    return this.prisma.client.conversation.count({
      where: { organizationId },
    });
  }

  private toDomain(
    raw: PrismaConversation & { messages: PrismaMessage[] },
  ): Conversation {
    return Conversation.reconstitute({
      id: raw.id,
      organizationId: raw.organizationId,
      title: raw.title,
      systemPrompt: raw.systemPrompt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      messages: raw.messages.map((m) =>
        Message.reconstitute({
          id: m.id,
          conversationId: m.conversationId,
          role: m.role as MessageRole,
          content: m.content,
          tokensUsed: m.tokensUsed,
          createdAt: m.createdAt,
        }),
      ),
    });
  }
}
