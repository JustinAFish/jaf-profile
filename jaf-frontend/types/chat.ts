export interface Source {
  title: string;
  content: string;
  document_title: string;
  document_path: string;
  relevance: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp: Date;
  /** True while tokens are still arriving for this assistant message (never persisted as true). */
  isStreaming?: boolean;
  /** True when the response ended in an error (content may hold partial output). */
  error?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  starred?: boolean;
  createdAt: Date;
  lastUpdated: Date;
}
