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

export default function ChatPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showExpandedSources] = useState(false);
  const { addMessage, ensureActiveChat, fetchUserChats } = useChatStore();
  const currentChat = useChatStore(selectCurrentChat);
  const welcomeModalOpen = useChatStore((s) => s.welcomeModalOpen);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_E2E === "true") {
      setIsAuthLoading(false);
      return;
    }

    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const checkAuth = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 200));

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
          console.log(
            "Chat page: Authentication check failed:",
            error,
            `(attempt ${retryCount + 1}/${maxRetries})`,
          );
        }

        if (retryCount < maxRetries && mounted) {
          retryCount++;
          setTimeout(() => {
            if (mounted) {
              checkAuth();
            }
          }, 500 * retryCount);
        } else if (mounted) {
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

  useEffect(() => {
    if (!isAuthLoading) {
      fetchUserChats();
    }
  }, [fetchUserChats, isAuthLoading]);

  if (isAuthLoading) {
    return (
      <div className="flex h-[calc(100vh-2rem)] items-center justify-center relative">
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

      const response = await fetch(backendApiUrl("/api/chat/message"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: userMessage,
          conversation_history: conversationHistory,
          chat_id: chatId,
        }),
      });

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
    <div className="flex h-[calc(100vh-2rem)]">
      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 flex flex-col">
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
          <ChatMessages
            isLoading={isLoading}
            showExpandedSources={showExpandedSources}
          />
          {currentChat && !welcomeModalOpen && (
            <ChatInput
              onSendMessage={handleMessageSent}
              disabled={isLoading}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
