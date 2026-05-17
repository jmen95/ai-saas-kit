import { MessageRole } from "../value-objects/message-role.vo";

export type MessageProps = {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  tokensUsed: number;
  createdAt: Date;
};

export class Message {
  private constructor(private readonly props: MessageProps) {}

  static create(input: {
    id: string;
    conversationId: string;
    role: MessageRole;
    content: string;
    tokensUsed?: number;
    createdAt?: Date;
  }): Message {
    return new Message({
      id: input.id,
      conversationId: input.conversationId,
      role: input.role,
      content: input.content,
      tokensUsed: input.tokensUsed ?? 0,
      createdAt: input.createdAt ?? new Date(),
    });
  }

  static reconstitute(props: MessageProps): Message {
    return new Message(props);
  }

  get id() {
    return this.props.id;
  }
  get conversationId() {
    return this.props.conversationId;
  }
  get role() {
    return this.props.role;
  }
  get content() {
    return this.props.content;
  }
  get tokensUsed() {
    return this.props.tokensUsed;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  toPersistence() {
    return {
      id: this.props.id,
      conversationId: this.props.conversationId,
      role: this.props.role,
      content: this.props.content,
      tokensUsed: this.props.tokensUsed,
      createdAt: this.props.createdAt,
    };
  }
}
