// Message.tsx — user and assistant chat bubbles
import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { User, BookOpen } from "lucide-react";
import { SourceDocumentCard } from "./SourceDocumentCard";
import { ThinkingOrb } from "./ThinkingOrb";
import type { Source } from "../types/chat";
import ReactMarkdown from "react-markdown";

interface MessageProps {
  type: "user" | "assistant";
  content: string;
  // The backend already filters sources by RAG_SOURCES_DISPLAY_MIN_RELEVANCE,
  // so everything here is display-worthy — no client-side re-filtering.
  sources?: Source[];
  isLoading?: boolean;
  /** True while tokens are still arriving — shows the orb cursor after the partial markdown. */
  isStreaming?: boolean;
  showExpandedSources?: boolean;
}

function MessageComponent({
  type,
  content,
  sources,
  isLoading,
  isStreaming,
  showExpandedSources = false,
}: MessageProps) {
  const reduceMotion = useReducedMotion();
  // Spring reveal for new bubbles; disabled (no initial offset) under reduced motion.
  const reveal = reduceMotion
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 12, filter: "blur(4px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        transition: { type: "spring" as const, stiffness: 260, damping: 28 },
      };

  if (type === "user") {
    return (
      <motion.div className="w-full my-4" {...reveal}>
        <div className="hover-lift bg-surface-container/50 p-6 rounded-xl border border-outline-variant/20 text-card-foreground backdrop-blur-xl backdrop-saturate-150">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center primary-glow">
              <User className="w-5 h-5 text-on-primary" />
            </div>
            <div className="flex-1">
              <p className="text-foreground leading-relaxed">{content}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const displaySources = sources ?? [];
  const showSourceDocuments = displaySources.length > 0;

  return (
    <motion.div className="w-full my-4" {...reveal}>
      <div className="hover-lift bg-surface-container-high/50 p-6 rounded-xl ai-glow border border-outline-variant/20 text-card-foreground backdrop-blur-xl backdrop-saturate-150">
        <div className="flex items-start gap-4">
          <div className="relative w-8 h-8 rounded-full border border-outline/30 overflow-hidden shrink-0">
            <Image
              src="/JAF_Photo.jpg"
              alt="Justin Fish"
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>

          <div className="flex-1">
            {isLoading || (isStreaming && content.length === 0) ? (
              <ThinkingOrb size={28} className="my-1" />
            ) : (
              <>
                <div className="text-foreground leading-relaxed mb-4 prose prose-invert max-w-none prose-p:text-paragraph prose-headings:text-header prose-a:text-primary-dim">
                  <ReactMarkdown>{content}</ReactMarkdown>
                  {isStreaming && (
                    <ThinkingOrb size={14} className="ml-1 align-middle" />
                  )}
                </div>

                {showSourceDocuments && !isStreaming && (
                  <motion.div className="mt-6" {...reveal}>
                    <div className="flex items-center gap-2 text-base font-medium text-muted-foreground mb-4 text-label-md uppercase tracking-wide">
                      <BookOpen className="w-4 h-4" />
                      <span>Source Documents</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-auto">
                      {displaySources.map((source, index) => (
                        <motion.div
                          className="h-fit transition-all"
                          key={`${source.document_path}-${index}`}
                          {...(reduceMotion
                            ? { initial: false as const }
                            : {
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 },
                                transition: {
                                  delay: 0.08 * index,
                                  type: "spring" as const,
                                  stiffness: 260,
                                  damping: 28,
                                },
                              })}
                        >
                          <SourceDocumentCard
                            source={source}
                            forceExpanded={showExpandedSources}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Memoized so a store update elsewhere doesn't re-render every bubble in the list. */
export const Message = React.memo(MessageComponent);
