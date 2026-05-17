import type { PlanLimits } from "@repo/shared";
import { Message } from "./message.entity";
import { MessageRole } from "../value-objects/message-role.vo";

function isThisMonth(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

export type ConversationProps = {
  id: string;
  organizationId: string;
  title: string | null;
  systemPrompt: string | null;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};

export class Conversation {
  private constructor(private readonly props: ConversationProps) {}

  static create(input: {
    id: string;
    organizationId: string;
    title?: string | null;
    systemPrompt?: string | null;
  }): Conversation {
    const now = new Date();
    return new Conversation({
      id: input.id,
      organizationId: input.organizationId,
      title: input.title ?? null,
      systemPrompt: input.systemPrompt ?? null,
      messages: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ConversationProps): Conversation {
    return new Conversation(props);
  }

  get id() {
    return this.props.id;
  }
  get organizationId() {
    return this.props.organizationId;
  }
  get title() {
    return this.props.title;
  }
  get systemPrompt() {
    return this.props.systemPrompt;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  get messages(): ReadonlyArray<Message> {
    return this.props.messages;
  }

  setTitle(title: string) {
    this.props.title = title;
  }

  setSystemPrompt(prompt: string | null) {
    this.props.systemPrompt = prompt;
  }

  addMessage(role: MessageRole, content: string, id: string): Message {
    const message = Message.create({
      id,
      conversationId: this.props.id,
      role,
      content,
    });
    this.props.messages.push(message);
    return message;
  }

  getContextWindow(maxMessages = 20): Message[] {
    return this.props.messages.slice(-maxMessages);
  }

  canAddMessage(planLimits: PlanLimits, orgMessagesUsed: number): boolean {
    if (planLimits.messagesPerMonth === Infinity) return true;
    return orgMessagesUsed < planLimits.messagesPerMonth;
  }

  countUserMessagesThisMonth(): number {
    return this.props.messages.filter(
      (m) => m.role === MessageRole.USER && isThisMonth(m.createdAt),
    ).length;
  }
}
