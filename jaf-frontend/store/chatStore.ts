import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Chat, Message, Source } from "@/types/chat";

const STORAGE_NAME = "jaf-chat-storage";
const LEGACY_STORAGE_NAME = "honda-chat-storage";

function normalizeSource(raw: Record<string, unknown>): Source {
  const relevance = raw.relevance;
  return {
    title: String(raw.title ?? ""),
    content: String(raw.content ?? ""),
    document_title: String(raw.document_title ?? raw.title ?? ""),
    document_path: String(raw.document_path ?? ""),
    relevance:
      typeof relevance === "number"
        ? relevance
        : Number(relevance) || 0,
  };
}

function rehydrateDates(chats: Chat[]): void {
  for (const chat of chats) {
    const raw = chat as unknown as {
      createdAt: unknown;
      lastUpdated?: unknown;
      updatedAt?: unknown;
    };
    chat.createdAt = new Date(raw.createdAt as string | number);
    const lu = raw.lastUpdated ?? raw.updatedAt ?? raw.createdAt;
    chat.lastUpdated = new Date(lu as string | number);
    delete (chat as unknown as { updatedAt?: unknown }).updatedAt;
    for (const m of chat.messages) {
      m.timestamp = new Date(m.timestamp as unknown as string | number);
    }
  }
}

const dualLocalStorage = {
  getItem: (name: string): string | null => {
    let s = localStorage.getItem(name);
    if (!s && name === STORAGE_NAME) {
      s = localStorage.getItem(LEGACY_STORAGE_NAME);
    }
    return s;
  },
  setItem: (name: string, value: string) => localStorage.setItem(name, value),
  removeItem: (name: string) => {
    localStorage.removeItem(name);
    if (name === STORAGE_NAME) {
      localStorage.removeItem(LEGACY_STORAGE_NAME);
    }
  },
};

interface ChatStore {
  chats: Chat[];
  currentChatId: string | null;
  isExamplesOpen: boolean;

  createChat: () => string;
  deleteChat: (id: string) => void;
  setCurrentChat: (id: string) => void;
  updateChatTitle: (id: string, title: string) => void;
  toggleStarChat: (id: string) => void;
  addMessage: (
    chatId: string,
    message: Omit<Message, "id" | "timestamp">,
  ) => void;
  getCurrentChat: () => Chat | undefined;
  ensureActiveChat: () => void;
  setChats: (chats: Chat[]) => void;
  fetchUserChats: () => Promise<void>;
  setIsExamplesOpen: (isOpen: boolean) => void;
}

export const selectCurrentChat = (state: ChatStore): Chat | undefined =>
  state.currentChatId
    ? state.chats.find((c) => c.id === state.currentChatId)
    : undefined;

export type { Chat, Message };

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      isExamplesOpen: false,

      createChat: () => {
        const newChat: Chat = {
          id: crypto.randomUUID(),
          title: "New Chat",
          messages: [],
          createdAt: new Date(),
          lastUpdated: new Date(),
        };

        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: newChat.id,
        }));

        return newChat.id;
      },

      deleteChat: (id: string) => {
        const state = get();
        const currentIndex = state.chats.findIndex((chat) => chat.id === id);
        const isCurrentChat = id === state.currentChatId;

        const newChats = state.chats.filter((chat) => chat.id !== id);

        let nextChatId: string | null = state.currentChatId;
        if (isCurrentChat) {
          if (newChats.length > 0) {
            const nextChat =
              newChats[currentIndex] || newChats[currentIndex - 1];
            nextChatId = nextChat ? nextChat.id : null;
          } else {
            const newChatId = get().createChat();
            nextChatId = newChatId;
          }
        }

        set({
          chats: newChats,
          currentChatId: nextChatId,
        });
      },

      setCurrentChat: (id: string) => {
        set({ currentChatId: id });
      },

      updateChatTitle: (id: string, title: string) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === id ? { ...chat, title } : chat,
          ),
        }));
      },

      toggleStarChat: (id: string) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === id ? { ...chat, starred: !chat.starred } : chat,
          ),
        }));
      },

      addMessage: (chatId: string, message) => {
        const fullMessage: Message = {
          id: crypto.randomUUID(),
          ...message,
          timestamp: new Date(),
          sources: message.sources,
        };

        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, fullMessage],
                  lastUpdated: new Date(),
                  title:
                    chat.title === "New Chat" && chat.messages.length === 0
                      ? `${message.content.slice(0, 30)}...`
                      : chat.title,
                }
              : chat,
          ),
        }));
      },

      getCurrentChat: () => {
        const state = get();
        return state.chats.find((chat) => chat.id === state.currentChatId);
      },

      ensureActiveChat: () => {
        const state = get();
        if (
          !state.currentChatId ||
          !state.chats.find((chat) => chat.id === state.currentChatId)
        ) {
          if (state.chats.length > 0) {
            set({ currentChatId: state.chats[0].id });
          } else {
            get().createChat();
          }
        }
      },

      setChats: (chats: Chat[]) => {
        set({
          chats,
          currentChatId: chats.length > 0 ? chats[0].id : null,
        });
      },

      fetchUserChats: async () => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
          return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          const response = await fetch(`${backendUrl}/api/chat/user/chats`, {
            method: "GET",
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            if (response.status === 404) {
              set({ chats: [] });
              return;
            }
            return;
          }

          const data = await response.json();

          type ServerMsg = {
            id?: string;
            role: "user" | "assistant";
            content: string;
            sources?: Record<string, unknown>[];
            created_at: string;
          };

          const transformedChats: Chat[] = Array.isArray(data.chats)
            ? data.chats.map(
                (chat: {
                  id: string;
                  title?: string;
                  messages?: ServerMsg[];
                  created_at: string;
                  updated_at: string;
                }) => ({
                  id: chat.id,
                  title: chat.title || "New Chat",
                  messages: Array.isArray(chat.messages)
                    ? chat.messages.map((msg) => ({
                        id: msg.id || crypto.randomUUID(),
                        role: msg.role,
                        content: msg.content,
                        sources: Array.isArray(msg.sources)
                          ? msg.sources.map((s) =>
                              normalizeSource(s as Record<string, unknown>),
                            )
                          : [],
                        timestamp: new Date(msg.created_at),
                      }))
                    : [],
                  createdAt: new Date(chat.created_at),
                  lastUpdated: new Date(chat.updated_at),
                }),
              )
            : [];

          set({ chats: transformedChats });

          if (transformedChats.length > 0 && !get().currentChatId) {
            set({ currentChatId: transformedChats[0].id });
          }
        } catch {
          clearTimeout(timeoutId);
        }
      },

      setIsExamplesOpen: (isOpen: boolean) => {
        set({ isExamplesOpen: isOpen });
      },
    }),
    {
      name: STORAGE_NAME,
      version: 1,
      storage: createJSONStorage(() => dualLocalStorage),
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.chats?.length) {
          rehydrateDates(state.chats);
        }
      },
    },
  ),
);
