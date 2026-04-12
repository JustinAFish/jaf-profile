/**
 * ChatMessages component - Core chat interface for message display.
 */
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Message } from "./Message";
import { selectCurrentChat, useChatStore } from "@/store/chatStore";
import { Modal } from "./Modal";
import { OrbitingCircles } from "@/components/magicui/orbiting-circles";
import { Icons } from "../public/svg/svgs";

interface ChatMessagesProps {
  isLoading: boolean;
  showExpandedSources?: boolean;
}

export function ChatMessages({
  isLoading,
  showExpandedSources = false,
}: ChatMessagesProps) {
  const currentChat = useChatStore(selectCurrentChat);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  /** Prevents reopening welcome when `currentChat` is replaced (same id, still empty) after fetch/hydration. */
  const welcomeDismissedForChatIdRef = useRef<string | null>(null);

  const dismissWelcome = useCallback(() => {
    if (currentChat?.id) {
      welcomeDismissedForChatIdRef.current = currentChat.id;
    }
    setShowWelcomeModal(false);
  }, [currentChat?.id]);

  const welcomeChatId = currentChat?.id;
  const welcomeMessageCount = currentChat?.messages.length ?? 0;

  useEffect(() => {
    if (welcomeChatId === undefined) {
      setShowWelcomeModal(true);
      return;
    }
    if (welcomeMessageCount > 0) {
      setShowWelcomeModal(false);
      welcomeDismissedForChatIdRef.current = null;
      return;
    }
    const shouldShow =
      welcomeDismissedForChatIdRef.current !== welcomeChatId;
    setShowWelcomeModal(shouldShow);
  }, [welcomeChatId, welcomeMessageCount]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages, isLoading]);

  const WelcomeContent = () => (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-heading font-semibold text-primary mb-2">
        Speak to AI Justin
      </h2>
      <p className="text-paragraph text-lg font-medium">
        Have an initial interview with AI Justin (although real Justin is
        better)
      </p>

      <p className="text-paragraph text-lg mt-2">
        This RAG solution primarily serves as a demonstration of my technical
        proficiency in artificial intelligence and full stack development. This
        product may have limitations regarding performance as it has been
        optimised for cost efficiency.
      </p>
      <h2 className="text-xl font-heading font-semibold text-header mt-2">
        Tech Stack
      </h2>
      <div className="relative flex h-[350px] w-full flex-col items-center justify-center overflow-hidden">
        <OrbitingCircles iconSize={40} radius={140}>
          <Icons.python />
          <Icons.openai />
          <Icons.langchain />
          <Icons.pinecone />
          <Icons.fastapi />
          <Icons.aws />
          <Icons.jwt />
          <Icons.gitHub />
        </OrbitingCircles>
        <OrbitingCircles iconSize={40} radius={70} reverse speed={2}>
          <Icons.nextjs />
          <Icons.react />
          <Icons.tailwind />
          <Icons.magicui />
          <Icons.shadcn />
          <Icons.typescript />
        </OrbitingCircles>
      </div>
      <button
        type="button"
        onClick={() => {
          dismissWelcome();
          setTimeout(() => {
            useChatStore.getState().setIsExamplesOpen(true);
          }, 100);
        }}
        className="mt-2 px-4 py-2 bg-primary text-on-primary rounded-md primary-glow hover:bg-primary/90 transition-colors"
      >
        Get Started
      </button>
    </div>
  );

  if (!currentChat) {
    return (
      <>
        <Modal isOpen={showWelcomeModal} onClose={dismissWelcome}>
          <WelcomeContent />
        </Modal>
        <div className="flex-1 fixed top-1/4 inset-0 -z-10 p-4 bg-transparent" />
        <div className="flex-1 fixed top-1/4 inset-0 -z-10 p-4 bg-transparent">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="relative">
              <div className="text-center space-y-4 ml-36 md:ml-64">
                <div className="glass-surface rounded-md p-6 bg-surface-container-high/60">
                  <h2 className="text-4xl font-heading font-semibold text-primary mb-8">
                    Speak to AI Justin
                  </h2>
                  <p className="text-paragraph text-xl">
                    Have an initial interview with AI Justin (although real
                    Justin is better).
                  </p>
                  <br />
                  <p className="text-paragraph text-xl">
                    This is largely to demonstrate my technical AI skills where I
                    have provided a few documents of myself into the RAG model.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4 pt-[calc(var(--site-header-height)+0.5rem)] bg-transparent relative z-[1]">
      <Modal isOpen={showWelcomeModal} onClose={dismissWelcome}>
        <WelcomeContent />
      </Modal>
      <div className="max-w-3xl mx-auto space-y-6">
        {currentChat.messages.length === 0 && !isLoading && (
          <Message
            type="assistant"
            content="Please ask me anything about me and my work. I'm here to help!"
            showExpandedSources={showExpandedSources}
          />
        )}

        {currentChat.messages.map((message) => (
          <div key={message.id}>
            <Message
              type={message.role}
              content={message.content}
              sources={message.sources}
              showExpandedSources={showExpandedSources}
            />
          </div>
        ))}

        {isLoading && (
          <Message
            key="loading-message"
            type="assistant"
            content=""
            isLoading={true}
            showExpandedSources={showExpandedSources}
          />
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
