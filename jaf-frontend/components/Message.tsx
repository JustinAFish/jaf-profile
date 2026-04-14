// Message.tsx — user and assistant chat bubbles
import React from "react";
import Image from "next/image";
import { User, BookOpen } from "lucide-react";
import { SourceDocumentCard } from "./SourceDocumentCard";
import type { Source } from "../types/chat";
import ReactMarkdown from "react-markdown";

/** Only show source cards when similarity is strictly above this (0–1 scale). */
const SOURCE_DISPLAY_MIN_RELEVANCE = 0.75;

interface MessageProps {
  type: "user" | "assistant";
  content: string;
  sources?: Source[] | string;
  isLoading?: boolean;
  showExpandedSources?: boolean;
}

export function Message({
  type,
  content,
  sources,
  isLoading,
  showExpandedSources = false,
}: MessageProps) {
  if (type === "user") {
    return (
      <div className="w-full my-4 animate-fadeIn">
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
      </div>
    );
  }

  const displaySources = Array.isArray(sources)
    ? sources.filter((s) => s.relevance > SOURCE_DISPLAY_MIN_RELEVANCE)
    : [];
  const showStringSources = typeof sources === "string" && sources.length > 0;
  const showSourceDocuments =
    showStringSources || displaySources.length > 0;

  return (
    <div className="w-full my-4 animate-fadeIn">
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
            {isLoading ? (
              <div className="loading-dots flex gap-2">
                <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                <div className="w-2.5 h-2.5 bg-primary rounded-full" />
              </div>
            ) : (
              <>
                <div className="text-foreground leading-relaxed mb-4 prose prose-invert max-w-none prose-p:text-paragraph prose-headings:text-header prose-a:text-primary-dim">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>

                {showSourceDocuments && (
                  <div className="mt-6 animate-fadeIn">
                    <div className="flex items-center gap-2 text-base font-medium text-muted-foreground mb-4 text-label-md uppercase tracking-wide">
                      <BookOpen className="w-4 h-4" />
                      <span>Source Documents</span>
                    </div>

                    {showStringSources ? (
                      <p className="text-sm text-muted-foreground">{sources}</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-auto">
                        {displaySources.map((source, index) => (
                          <div
                            className="h-fit transition-all"
                            key={`${source.document_path}-${index}`}
                          >
                            <SourceDocumentCard
                              source={source}
                              forceExpanded={showExpandedSources}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
