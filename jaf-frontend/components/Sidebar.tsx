"use client";

/**
 * Sidebar component - Manages chat history and new conversation creation.
 */

import React, { useState, useRef, useEffect } from "react";
import { Plus, Search, Star, Trash2, X } from "lucide-react";
import { useChatStore } from "../store/chatStore";

export function Sidebar() {
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
    <div className="flex">
      <div className="w-36 md:w-64 bg-surface-container/95 backdrop-blur-lg flex flex-col min-h-screen pt-[var(--site-header-height)]">
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
                  setCurrentChat(chat.id);
                }
              }}
              onClick={() => setCurrentChat(chat.id)}
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

                  <div className="md:flex items-center gap-1 hidden">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStarChat(chat.id);
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-surface-container rounded-md transition-all duration-200"
                    >
                      <Star
                        className={`w-4 h-4 text-foreground ${chat.starred ? "fill-primary text-primary" : ""}`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(chat.id, e)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-surface-container rounded-md transition-all duration-200"
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
          <div className="fixed inset-0 bg-surface/70 backdrop-blur-sm flex items-center justify-center z-50">
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
    </div>
  );
}
