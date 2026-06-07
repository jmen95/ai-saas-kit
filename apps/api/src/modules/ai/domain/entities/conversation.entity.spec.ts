import { PLAN_LIMITS } from "@repo/shared";
import { Conversation } from "./conversation.entity";
import { MessageRole } from "../value-objects/message-role.vo";

describe("Conversation entity", () => {
  function makeConversation() {
    return Conversation.create({ id: "c1", organizationId: "org1" });
  }

  it("starts empty with the provided identifiers", () => {
    const convo = makeConversation();
    expect(convo.id).toBe("c1");
    expect(convo.organizationId).toBe("org1");
    expect(convo.messages).toHaveLength(0);
    expect(convo.systemPrompt).toBeNull();
  });

  it("appends messages in order", () => {
    const convo = makeConversation();
    convo.addMessage(MessageRole.USER, "Hello", "m1");
    convo.addMessage(MessageRole.ASSISTANT, "Hi there", "m2");
    expect(convo.messages).toHaveLength(2);
    expect(convo.messages[0]?.content).toBe("Hello");
    expect(convo.messages[1]?.role).toBe(MessageRole.ASSISTANT);
  });

  it("allows messages on FREE plan while under the monthly limit", () => {
    const convo = makeConversation();
    expect(convo.canAddMessage(PLAN_LIMITS.FREE, 49)).toBe(true);
  });

  it("blocks messages on FREE plan once the monthly limit is reached", () => {
    const convo = makeConversation();
    expect(convo.canAddMessage(PLAN_LIMITS.FREE, 50)).toBe(false);
  });

  it("never blocks plans with unlimited messages", () => {
    const convo = makeConversation();
    expect(convo.canAddMessage(PLAN_LIMITS.ENTERPRISE, 10_000)).toBe(true);
  });

  it("limits the context window to the most recent messages", () => {
    const convo = makeConversation();
    for (let i = 0; i < 30; i++) {
      convo.addMessage(MessageRole.USER, `msg-${i}`, `m${i}`);
    }
    const window = convo.getContextWindow(20);
    expect(window).toHaveLength(20);
    expect(window[0]?.content).toBe("msg-10");
    expect(window[19]?.content).toBe("msg-29");
  });
});
