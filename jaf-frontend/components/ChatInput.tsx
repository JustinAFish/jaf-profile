/**
 * ChatInput component - Handles user message input and submission.
 */
import React, { useState, useEffect, useRef } from "react";
import { Send, Lightbulb } from "lucide-react";
import { ExampleQuestions } from "./ExampleQuestions";
import { useChatStore } from "@/store/chatStore";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  messageCount?: number;
  isLoading?: boolean;
}

export function ChatInput({
  onSendMessage,
  disabled,
  messageCount = 0,
  isLoading,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showHint, setShowHint] = useState(false);
  const { isExamplesOpen, setIsExamplesOpen } = useChatStore();
  const examplesAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageCount === 0) {
      const timer = setTimeout(() => {
        setShowHint(true);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setShowHint(false);
    }
  }, [messageCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const currentMessage = message.trim();
    if (!currentMessage || disabled) return;

    onSendMessage(currentMessage);
    setMessage("");
    setShowHint(false);
  };

  const handleExamplesButtonClick = () => {
    setIsExamplesOpen(!isExamplesOpen);
    setShowHint(false);
  };

  const handleExampleClick = (question: string) => {
    onSendMessage(question);
    setIsExamplesOpen(false);
    setShowHint(false);
  };

  return (
    <div className="sticky bottom-0 z-[2] pb-2">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto w-full">
        <div className="card hover-lift flex items-center gap-2 p-2 glass-surface rounded-md ghost-border">
          <div className="relative" ref={examplesAnchorRef}>
            <button
              type="button"
              onClick={handleExamplesButtonClick}
              className="relative p-2.5 hover:bg-primary/10 rounded-md text-muted-foreground hover:text-primary transition-all duration-200 group"
              disabled={disabled}
            >
              <Lightbulb
                className={`w-5 h-5 transition-all duration-300 ${
                  showHint ? "animate-pulse text-primary" : ""
                }`}
              />

              {showHint && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-surface-container-high text-foreground text-label-md rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 ghost-border ambient-float">
                  Click for example questions
                </div>
              )}
            </button>

            <ExampleQuestions
              isOpen={isExamplesOpen}
              onClose={() => setIsExamplesOpen(false)}
              onQuestionClick={handleExampleClick}
              anchorRef={examplesAnchorRef}
            />
          </div>

          <input
            type="text"
            data-testid="chat-message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send a message..."
            className="flex-1 p-3 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none input-focus-glow rounded-md transition-all duration-200"
            disabled={disabled}
          />

          <button
            type="submit"
            data-testid="chat-send"
            disabled={disabled || isLoading}
            className={`p-2.5 bg-primary text-on-primary rounded-md primary-glow flex items-center justify-center transition-all duration-200 ${
              disabled || isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-primary/90 hover:scale-[1.03]"
            }`}
          >
            <Send className={`w-5 h-5 ${isLoading ? "animate-pulse" : ""}`} />
          </button>
        </div>
      </form>
    </div>
  );
}
