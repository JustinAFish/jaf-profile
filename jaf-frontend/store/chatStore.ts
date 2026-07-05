import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Chat, Message } from "@/types/chat";

const STORAGE_NAME = "jaf-chat-storage";
const LEGACY_STORAGE_NAME = "honda-chat-storage";

/** Shape of a persisted chat before dates are rehydrated: timestamps arrive as strings/numbers from JSON. */
type PersistedChat = Omit<Chat, "createdAt" | "lastUpdated" | "messages"> & {
  createdAt: string | number | Date;
  lastUpdated?: string | number | Date;
  updatedAt?: string | number | Date;
  messages: (Omit<Message, "timestamp"> & {
    timestamp: string | number | Date;
  })[];
};

/** Convert the string/number timestamps from persisted JSON back into Date objects, in place. */
function rehydrateDates(chats: Chat[]): void {
  for (const persisted of chats as unknown as PersistedChat[]) {
    const chat = persisted as unknown as Chat;
    chat.createdAt = new Date(persisted.createdAt);
    chat.lastUpdated = new Date(
      persisted.lastUpdated ?? persisted.updatedAt ?? persisted.createdAt,
    );
    delete persisted.updatedAt;
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
  /** True while the welcome / "Speak to AI Justin" modal blocks the composer (not persisted). */
  welcomeModalOpen: boolean;

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
  setIsExamplesOpen: (isOpen: boolean) => void;
  setWelcomeModalOpen: (open: boolean) => void;
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
      welcomeModalOpen: false,

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

      setIsExamplesOpen: (isOpen: boolean) => {
        set({ isExamplesOpen: isOpen });
      },

      setWelcomeModalOpen: (open: boolean) => {
        set({ welcomeModalOpen: open });
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
