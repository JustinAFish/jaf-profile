"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatInput } from "@/components/ChatInput";
import { selectCurrentChat, useChatStore } from "@/store/chatStore";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { appUrl } from "@/lib/appOrigin";
import { backendApiUrl } from "@/lib/backendApiUrl";

const debugAuth =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEBUG_AUTH === "true";

// Abort the chat request if the backend hasn't responded; RAG + LLM can be slow.
const CHAT_REQUEST_TIMEOUT_MS = 60000;

/** Full-bleed background image shared by the auth-loading and chat states. */
function ChatBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Image
        src="/data-background.jpeg"
        alt="Background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-surface/80" />
    </div>
  );
}

export default function ChatPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showExpandedSources] = useState(false);
  const addMessage = useChatStore((s) => s.addMessage);
  const ensureActiveChat = useChatStore((s) => s.ensureActiveChat);
  const currentChat = useChatStore(selectCurrentChat);
  const welcomeModalOpen = useChatStore((s) => s.welcomeModalOpen);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_E2E === "true") {
      setIsAuthLoading(false);
      return;
    }

    let mounted = true;

    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error || !user) {
          throw error ?? new Error("Not authenticated");
        }
        if (debugAuth) {
          console.log("Chat page: User authenticated:", user.email ?? user.id);
        }
        if (mounted) {
          setIsAuthLoading(false);
        }
      } catch (error) {
        if (debugAuth) {
          console.log("Chat page: Authentication check failed:", error);
        }
        if (mounted) {
          const signInUrl = `${appUrl("/chat/sign-in")}?redirect_url=${encodeURIComponent(window.location.pathname)}`;
          window.location.href = signInUrl;
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthLoading) {
      ensureActiveChat();
    }
  }, [ensureActiveChat, isAuthLoading]);

  if (isAuthLoading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center relative">
        <ChatBackground />
        <div className="text-foreground text-center relative z-[1]">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4 rounded-full" />
          <p className="text-paragraph">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const handleMessageSent = async (userMessage: string) => {
    if (!currentChat) return;
    const chatId = currentChat.id;
    try {
      setIsLoading(true);

      addMessage(chatId, {
        role: "user",
        content: userMessage,
      });

      const chatAfterUser = useChatStore.getState().getCurrentChat();
      if (!chatAfterUser || chatAfterUser.id !== chatId) {
        return;
      }

      const conversationHistory = chatAfterUser.messages.slice(-5).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error("Backend URL not configured");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        CHAT_REQUEST_TIMEOUT_MS,
      );

      let response: Response;
      try {
        response = await fetch(backendApiUrl("/api/chat/message"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: userMessage,
            conversation_history: conversationHistory,
            chat_id: chatId,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) throw new Error("Failed to send message");
      const data = await response.json();

      addMessage(chatId, {
        role: "assistant",
        content: data.response,
        sources: data.sources,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage(chatId, {
        role: "assistant",
        content: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[100dvh]">
      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <ChatBackground />
          <ChatMessages
            isLoading={isLoading}
            showExpandedSources={showExpandedSources}
          />
          {currentChat && !welcomeModalOpen && (
            <ChatInput
              onSendMessage={handleMessageSent}
              disabled={isLoading}
              isLoading={isLoading}
              messageCount={currentChat.messages.length}
            />
          )}
        </div>
      </div>
    </div>
  );
}
