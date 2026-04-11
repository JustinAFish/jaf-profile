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
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  starred?: boolean;
  createdAt: Date;
  lastUpdated: Date;
}
