import { beforeEach, describe, expect, it } from "vitest";
import { useChatStore } from "@/store/chatStore";

function resetStore() {
  localStorage.clear();
  useChatStore.setState({
    chats: [],
    currentChatId: null,
    isExamplesOpen: false,
    welcomeModalOpen: false,
  });
}

describe("useChatStore", () => {
  beforeEach(() => {
    resetStore();
  });

  it("createChat adds a chat and selects it", () => {
    const id = useChatStore.getState().createChat();
    const state = useChatStore.getState();
    expect(state.chats).toHaveLength(1);
    expect(state.currentChatId).toBe(id);
    expect(state.chats[0].title).toBe("New Chat");
  });

  it("deleteChat on sole chat clears list; ensureActiveChat creates a new chat", () => {
    const id = useChatStore.getState().createChat();
    useChatStore.getState().deleteChat(id);
    expect(useChatStore.getState().chats).toHaveLength(0);
    useChatStore.getState().ensureActiveChat();
    const state = useChatStore.getState();
    expect(state.chats).toHaveLength(1);
    expect(state.currentChatId).toBe(state.chats[0].id);
  });

  it("ensureActiveChat creates a chat when empty", () => {
    useChatStore.getState().ensureActiveChat();
    const state = useChatStore.getState();
    expect(state.chats.length).toBeGreaterThanOrEqual(1);
    expect(state.currentChatId).toBeTruthy();
  });

  it("addMessage appends to the correct chat", () => {
    const id = useChatStore.getState().createChat();
    useChatStore.getState().addMessage(id, { role: "user", content: "Hello" });
    const chat = useChatStore.getState().getCurrentChat();
    expect(chat?.messages).toHaveLength(1);
    expect(chat?.messages[0].content).toBe("Hello");
    expect(chat?.messages[0].role).toBe("user");
  });

  it("startAssistantMessage creates an empty streaming assistant message", () => {
    const chatId = useChatStore.getState().createChat();
    const messageId = useChatStore.getState().startAssistantMessage(chatId);
    const chat = useChatStore.getState().getCurrentChat();
    expect(chat?.messages).toHaveLength(1);
    const msg = chat!.messages[0];
    expect(msg.id).toBe(messageId);
    expect(msg.role).toBe("assistant");
    expect(msg.content).toBe("");
    expect(msg.isStreaming).toBe(true);
  });

  it("appendMessageContent accumulates deltas on the target message only", () => {
    const chatId = useChatStore.getState().createChat();
    useChatStore.getState().addMessage(chatId, { role: "user", content: "Q" });
    const messageId = useChatStore.getState().startAssistantMessage(chatId);
    useChatStore.getState().appendMessageContent(chatId, messageId, "Hello");
    useChatStore.getState().appendMessageContent(chatId, messageId, " world");
    const chat = useChatStore.getState().getCurrentChat();
    expect(chat?.messages[0].content).toBe("Q");
    expect(chat?.messages[1].content).toBe("Hello world");
  });

  it("finalizeAssistantMessage clears streaming and attaches sources", () => {
    const chatId = useChatStore.getState().createChat();
    const messageId = useChatStore.getState().startAssistantMessage(chatId);
    useChatStore.getState().appendMessageContent(chatId, messageId, "Answer");
    const sources = [
      {
        title: "Doc",
        content: "excerpt",
        document_title: "Doc",
        document_path: "/x.pdf",
        relevance: 0.9,
      },
    ];
    useChatStore
      .getState()
      .finalizeAssistantMessage(chatId, messageId, { sources });
    const msg = useChatStore.getState().getCurrentChat()!.messages[0];
    expect(msg.isStreaming).toBe(false);
    expect(msg.content).toBe("Answer");
    expect(msg.sources).toEqual(sources);
    expect(msg.error).toBeUndefined();
  });

  it("finalizeAssistantMessage with content + error replaces content and flags error", () => {
    const chatId = useChatStore.getState().createChat();
    const messageId = useChatStore.getState().startAssistantMessage(chatId);
    useChatStore.getState().appendMessageContent(chatId, messageId, "partial");
    useChatStore.getState().finalizeAssistantMessage(chatId, messageId, {
      content: "partial\n\n*An error occurred. Please try again.*",
      error: true,
    });
    const msg = useChatStore.getState().getCurrentChat()!.messages[0];
    expect(msg.isStreaming).toBe(false);
    expect(msg.error).toBe(true);
    expect(msg.content).toContain("partial");
    expect(msg.content).toContain("error occurred");
  });
});
