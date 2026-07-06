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
import { readChatStream, type FinalPayload } from "@/lib/chatStream";
import { glBus } from "@/lib/glBus";
import { useGlActive } from "@/components/gl/useGlActive";

const debugAuth =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEBUG_AUTH === "true";

// Abort the chat request if the backend hasn't responded; RAG + LLM can be slow.
const CHAT_REQUEST_TIMEOUT_MS = 60000;

// Once streaming, abort if no chunk arrives for this long (per-chunk idle timeout).
const CHAT_STREAM_IDLE_TIMEOUT_MS = 30000;

// Streamed tokens are buffered and flushed to the store on this cadence — each
// flush is one zustand set (and one localStorage persist write), not one per token.
const STREAM_FLUSH_INTERVAL_MS = 80;

/**
 * Full-bleed background shared by the auth-loading and chat states. With the
 * WebGL layer active it becomes a translucent scrim over the shared canvas
 * (ChatAmbient); otherwise it keeps the static image + tint.
 */
function ChatBackground() {
  const glActive = useGlActive();

  if (glActive) {
    return (
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-surface/80 via-surface/60 to-surface/40" />
    );
  }

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
  const startAssistantMessage = useChatStore((s) => s.startAssistantMessage);
  const appendMessageContent = useChatStore((s) => s.appendMessageContent);
  const finalizeAssistantMessage = useChatStore(
    (s) => s.finalizeAssistantMessage,
  );
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
    let assistantMessageId: string | null = null;

    try {
      setIsLoading(true);
      glBus.chatThinking = true;

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

      const requestBody = JSON.stringify({
        content: userMessage,
        conversation_history: conversationHistory,
        chat_id: chatId,
      });

      // One controller for the whole exchange: 60s to first byte, then a 30s
      // inter-chunk idle timer reset on every received chunk.
      const controller = new AbortController();
      let timeoutId = setTimeout(
        () => controller.abort(),
        CHAT_REQUEST_TIMEOUT_MS,
      );
      const resetIdleTimer = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(
          () => controller.abort(),
          CHAT_STREAM_IDLE_TIMEOUT_MS,
        );
      };

      try {
        const response = await fetch(backendApiUrl("/api/chat/stream"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: requestBody,
          signal: controller.signal,
        });

        // Older backend deployments (and the E2E stub before it grew a stream
        // route) don't have /chat/stream — fall back to the single-shot endpoint.
        if (response.status === 404 || response.status === 405) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(
            () => controller.abort(),
            CHAT_REQUEST_TIMEOUT_MS,
          );
          const legacy = await fetch(backendApiUrl("/api/chat/message"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: requestBody,
            signal: controller.signal,
          });
          if (!legacy.ok) throw new Error("Failed to send message");
          const data = await legacy.json();
          addMessage(chatId, {
            role: "assistant",
            content: data.response,
            sources: data.sources,
          });
          return;
        }

        if (!response.ok) throw new Error("Failed to send message");

        assistantMessageId = startAssistantMessage(chatId);
        const messageId = assistantMessageId;

        // Buffer deltas and flush on an interval — one store set (and one
        // localStorage persist write) per flush instead of per token.
        let pending = "";
        let streamErrorDetail: string | null = null;
        const flush = () => {
          if (!pending) return;
          appendMessageContent(chatId, messageId, pending);
          pending = "";
          glBus.chatStreamPulse++;
        };
        const flushInterval = setInterval(flush, STREAM_FLUSH_INTERVAL_MS);

        let finalSources: FinalPayload["sources"];
        try {
          await readChatStream(
            response,
            {
              onToken: (delta) => {
                pending += delta;
              },
              onFinal: (payload) => {
                finalSources = payload.sources;
              },
              onError: (detail) => {
                streamErrorDetail = detail;
              },
            },
            resetIdleTimer,
          );
        } finally {
          clearInterval(flushInterval);
          flush();
        }

        if (streamErrorDetail) throw new Error(streamErrorDetail);

        finalizeAssistantMessage(chatId, messageId, {
          sources: finalSources,
        });
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      if (assistantMessageId) {
        // Keep whatever streamed before the failure; append the error note.
        const partial = useChatStore
          .getState()
          .chats.find((c) => c.id === chatId)
          ?.messages.find((m) => m.id === assistantMessageId)?.content;
        finalizeAssistantMessage(chatId, assistantMessageId, {
          content: `${partial ? `${partial}\n\n` : ""}*An error occurred. Please try again.*`,
          error: true,
        });
      } else {
        addMessage(chatId, {
          role: "assistant",
          content: "An error occurred. Please try again.",
          error: true,
        });
      }
    } finally {
      glBus.chatThinking = false;
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
