/**
 * SourceDocumentCard component - Displays a card for a source document, including its title, relevance score, and content.
 * Features:
 * - Expandable/collapsible content section to show more details
 * - Formatting for relevance score as a percentage
 * - Strategic line breaks in the content to improve readability
 * - Hyperlink to open the full document in the documents page
 */

"use client"
import React, { useState, useEffect, useRef } from 'react';
import { FileText, ChevronRight, ExternalLink, Ban } from 'lucide-react';
import type { Source } from '../types/chat';
import { Modal } from './Modal';

interface SourceDocumentCardProps {
  source: Source;
  forceExpanded?: boolean; 
}

function SourceDocumentCardComponent({ source, forceExpanded }: SourceDocumentCardProps) {
  const [isExpanded, setIsExpanded] = useState(forceExpanded || false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (forceExpanded !== undefined) {
      setIsExpanded(forceExpanded);
    }
  }, [forceExpanded]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      window.dispatchEvent(new CustomEvent('sourceResize'));
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const handleDocumentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowAccessModal(true);
  };

  const formatRelevance = (score: number) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  const formatContent = (content: string) => {
    const formattedContent = content
      .replace(/\bA:/, '\nA:')
      .replace(/\?(\s+)([^?])/g, '?\n$2');

    return (
      <div className="italic text-muted-foreground">
        {formattedContent}
      </div>
    );
  };

  return (
    <>
      <Modal isOpen={showAccessModal} onClose={() => setShowAccessModal(false)}>
        <div className="text-center">
          <Ban className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-red-500 mb-4">Source Document Access Restricted</h2>
        </div>
      </Modal>
      <div
        ref={containerRef}
        className="card hover-lift bg-surface-container-high/70 backdrop-blur-sm transition-all duration-300 rounded-md ghost-border"
      >
        <div className="flex">
          <div className="w-16 p-4 flex items-center justify-center rounded-md">
            <FileText className="w-6 h-6 text-primary" />
          </div>

          <div className="flex-1 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  {source.title || source.document_path.split('/').pop()}
                </h4>
                
                <button 
                  onClick={handleDocumentClick}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group"
                >
                  <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                  <span>Open document</span>
                </button>
              </div>

              <button 
                onClick={() => !forceExpanded && setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                data-expanded={isExpanded}
              >
                <ChevronRight 
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                    isExpanded ? 'rotate-90' : ''
                  }`} 
                />
              </button>
            </div>
          </div>
        </div>

        <div
          className={`transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-96 overflow-y-auto overscroll-contain" : "max-h-0 overflow-hidden"
          }`}
        >
          <div className="p-4 bg-surface-container-lowest/90 mt-1 rounded-b-md">
            {typeof source.relevance === "number" && (
              <div className="mb-3 flex items-center">
                <span className="text-xs text-muted-foreground">Relevance:</span>
                <code className="ml-2 text-xs px-1.5 py-0.5 rounded-md bg-surface-container text-foreground font-mono">
                  {formatRelevance(source.relevance)}
                </code>
              </div>
            )}

            <div className="text-sm text-paragraph whitespace-pre-wrap rounded-md bg-surface-container/80 p-3">
              {formatContent(source.content)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** Memoized so re-renders of the message list don't rebuild every source card. */
export const SourceDocumentCard = React.memo(SourceDocumentCardComponent);