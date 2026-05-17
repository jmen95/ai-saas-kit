import { Conversation } from "../entities/conversation.entity";

export interface IConversationRepository {
  findById(id: string, organizationId: string): Promise<Conversation | null>;
  findByOrganization(organizationId: string): Promise<Conversation[]>;
  save(conversation: Conversation): Promise<void>;
  delete(id: string, organizationId: string): Promise<void>;
  countByOrganization(organizationId: string): Promise<number>;
}

export const CONVERSATION_REPOSITORY = Symbol("CONVERSATION_REPOSITORY");
