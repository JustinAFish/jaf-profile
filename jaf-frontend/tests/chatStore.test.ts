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
});
