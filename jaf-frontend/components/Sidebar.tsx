"use client";

/**
 * Sidebar component - Manages chat history and new conversation creation.
 */

import React, { useState, useRef, useEffect } from "react";
import { Menu, Plus, Search, Star, Trash2, X } from "lucide-react";
import { useChatStore } from "../store/chatStore";

type SidebarPanelProps = {
  onSelectChat?: () => void;
  showCloseButton?: boolean;
  onClose?: () => void;
};

function SidebarPanel({
  onSelectChat,
  showCloseButton,
  onClose,
}: SidebarPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  const {
    chats,
    currentChatId,
    createChat,
    deleteChat,
    setCurrentChat,
    toggleStarChat,
    updateChatTitle,
  } = useChatStore();

  const existingNewChat = chats.find((chat) => chat.title === "New Chat");
  const isOnNewChat =
    currentChatId !== null && existingNewChat?.id === currentChatId;

  const handleNewChatClick = () => {
    if (existingNewChat) {
      setCurrentChat(existingNewChat.id);
    } else {
      createChat();
    }
    onSelectChat?.();
  };

  const pickChat = (chatId: string) => {
    setCurrentChat(chatId);
    onSelectChat?.();
  };

  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChatId]);

  const startEditing = (
    chat: { id: string; title: string },
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleTitleSubmit = () => {
    if (editingChatId) {
      const newTitle = editingTitle.trim();
      if (newTitle) {
        updateChatTitle(editingChatId, newTitle);
      }
      setEditingChatId(null);
      setEditingTitle("");
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditingChatId(null);
      setEditingTitle("");
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return (
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  });

  const handleDeleteClick = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(chatId);
  };

  const handleDeleteConfirm = () => {
    if (chatToDelete) {
      deleteChat(chatToDelete);
      setChatToDelete(null);
    }
  };

  const searchInputClass =
    "w-full bg-surface-container-lowest text-foreground pl-9 pr-4 py-2 rounded-md placeholder:text-muted-foreground ghost-border input-focus-glow transition-all duration-200";

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-surface-container/95 pt-[var(--site-header-height)] backdrop-blur-lg md:w-64">
      {showCloseButton && onClose ? (
        <div className="flex items-center justify-end px-3 pb-1 md:hidden shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat list"
            className="rounded-md p-2 text-muted-foreground hover:bg-surface-container-high hover:text-foreground transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : null}
      <div className="p-4">
          <button
            type="button"
            onClick={handleNewChatClick}
            disabled={isOnNewChat}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200 text-label-md uppercase tracking-wide ${
              isOnNewChat
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-on-primary primary-glow hover:bg-primary/90"
            }`}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="px-4 pb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className={searchInputClass}
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {sortedChats.map((chat) => (
            <div
              key={chat.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  pickChat(chat.id);
                }
              }}
              onClick={() => pickChat(chat.id)}
              className={`
                group mx-2 rounded-md cursor-pointer mb-1 transition-all duration-200
                ${
                  chat.id === currentChatId
                    ? "bg-surface-container-high text-primary shadow-[inset_3px_0_0_0_var(--primary),0_0_16px_rgba(129,236,255,0.06)]"
                    : "bg-transparent hover:bg-surface-container-high/40"
                }
              `}
            >
              <div className="px-3 py-3">
                <div className="flex justify-between items-start w-full">
                  <div className="flex-1 pr-2 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2 w-full overflow-hidden">
                      <div className="flex-shrink-0">
                        {chat.starred && (
                          <Star className="w-4 h-4 text-primary fill-primary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        {editingChatId === chat.id ? (
                          <input
                            ref={editInputRef}
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={handleTitleSubmit}
                            onKeyDown={handleTitleKeyDown}
                            className="text-foreground font-medium bg-surface-container-lowest rounded-md px-2 py-1 w-full outline-none ghost-border input-focus-glow transition-all duration-200"
                            onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                              e.stopPropagation();
                            }}
                          />
                        ) : (
                          <div
                            role="presentation"
                            onDoubleClick={(e) => startEditing(chat, e)}
                            className={`font-medium truncate transition-all duration-200 ${
                              chat.id === currentChatId
                                ? "text-primary"
                                : "text-foreground"
                            }`}
                          >
                            {chat.title}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className={`text-label-md mt-1 transition-all duration-200 ${
                        chat.id === currentChatId
                          ? "text-primary/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {new Date(chat.lastUpdated).toLocaleDateString()} ·{" "}
                      {new Date(chat.lastUpdated).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStarChat(chat.id);
                      }}
                      className="p-1 hover:bg-surface-container rounded-md transition-all duration-200"
                    >
                      <Star
                        className={`w-4 h-4 text-foreground ${chat.starred ? "fill-primary text-primary" : ""}`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(chat.id, e)}
                      className="p-1 hover:bg-surface-container rounded-md transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4 text-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {chatToDelete && (
          <div className="fixed inset-0 bg-surface/70 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="bg-surface-container-high rounded-md p-6 max-w-md w-full mx-4 ambient-float">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  Delete Chat
                </h3>
                <button
                  type="button"
                  onClick={() => setChatToDelete(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this chat? This action cannot be
                undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setChatToDelete(null)}
                  className="px-4 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-container transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <div className="relative shrink-0 h-full min-h-0">
      <div className="hidden md:flex h-full min-h-0">
        <SidebarPanel />
      </div>

      <button
        type="button"
        aria-label="Open chat list"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed z-30 rounded-md border border-border/50 bg-surface-container/95 p-2.5 text-foreground shadow-md backdrop-blur-lg left-3 top-[calc(var(--site-header-height)+0.75rem)] hover:bg-surface-container-high transition-colors duration-200"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      {mobileOpen ? (
        <>
          <button
            type="button"
            aria-label="Dismiss chat list"
            className="md:hidden fixed inset-0 z-[80] bg-surface/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="md:hidden fixed left-0 top-0 bottom-0 z-[90] w-[min(18rem,88vw)] flex flex-col border-r border-border/40 bg-surface-container/95 shadow-xl backdrop-blur-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Chats"
          >
            <SidebarPanel
              showCloseButton
              onClose={() => setMobileOpen(false)}
              onSelectChat={() => setMobileOpen(false)}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
